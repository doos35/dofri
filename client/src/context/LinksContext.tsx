import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Link, HealthStatus, RatingSummary } from '../types';
import * as api from '../api/linksApi';
import { getVisitorId } from '../utils/visitorId';

interface LinksContextType {
  links: Link[];
  healthStatuses: Map<string, HealthStatus>;
  ratings: Map<string, RatingSummary>;
  categories: string[];
  tags: { tag: string; count: number }[];
  loading: boolean;
  searchTerm: string;
  activeCategory: string;
  activeTags: string[];
  sortBy: string;
  setSearchTerm: (term: string) => void;
  setActiveCategory: (cat: string) => void;
  toggleTag: (tag: string) => void;
  setSortBy: (sort: string) => void;
  refreshLinks: () => Promise<void>;
  refreshHealth: () => Promise<void>;
  refreshRatings: () => Promise<void>;
}

const LinksContext = createContext<LinksContextType | null>(null);

export function LinksProvider({ children }: { children: ReactNode }) {
  const [links, setLinks] = useState<Link[]>([]);
  const [healthStatuses, setHealthStatuses] = useState<Map<string, HealthStatus>>(new Map());
  const [ratings, setRatings] = useState<Map<string, RatingSummary>>(new Map());
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<{ tag: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('');

  const refreshLinks = useCallback(async () => {
    try {
      setLoading(true);
      const [linksData, catsData, tagsData] = await Promise.all([
        api.fetchLinks({
          search: searchTerm || undefined,
          category: activeCategory || undefined,
          tags: activeTags.length > 0 ? activeTags.join(',') : undefined,
          sort: sortBy || undefined,
        }),
        api.fetchCategories(),
        api.fetchTags(),
      ]);
      setLinks(linksData);
      setCategories(catsData);
      setTags(tagsData);
    } catch (err) {
      console.error('Failed to fetch links:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, activeCategory, activeTags, sortBy]);

  const refreshHealth = useCallback(async () => {
    try {
      const statuses = await api.fetchHealthStatuses();
      const map = new Map<string, HealthStatus>();
      for (const s of statuses) {
        map.set(s.linkId, s);
      }
      setHealthStatuses(map);
    } catch (err) {
      console.error('Failed to fetch health statuses:', err);
    }
  }, []);

  const refreshRatings = useCallback(async () => {
    try {
      const summaries = await api.fetchRatings(getVisitorId());
      const map = new Map<string, RatingSummary>();
      for (const s of summaries) map.set(s.linkId, s);
      setRatings(map);
    } catch (err) {
      console.error('Failed to fetch ratings:', err);
    }
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setActiveTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }, []);

  useEffect(() => {
    refreshLinks();
  }, [refreshLinks]);

  useEffect(() => {
    refreshHealth();
    refreshRatings();
    const interval = setInterval(refreshHealth, 60000);
    return () => clearInterval(interval);
  }, [refreshHealth, refreshRatings]);

  return (
    <LinksContext.Provider
      value={{
        links,
        healthStatuses,
        ratings,
        categories,
        tags,
        loading,
        searchTerm,
        activeCategory,
        activeTags,
        sortBy,
        setSearchTerm,
        setActiveCategory,
        toggleTag,
        setSortBy,
        refreshLinks,
        refreshHealth,
        refreshRatings,
      }}
    >
      {children}
    </LinksContext.Provider>
  );
}

export function useLinksContext() {
  const ctx = useContext(LinksContext);
  if (!ctx) throw new Error('useLinksContext must be used within LinksProvider');
  return ctx;
}
