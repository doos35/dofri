import { useState, useEffect, FormEvent } from 'react';
import { Globe, Plus, X } from 'lucide-react';
import { Link as LinkType, CreateLinkDTO, UpdateLinkDTO } from '../types';

interface LinkFormProps {
  link?: LinkType | null;
  categories: string[];
  onSubmit: (data: CreateLinkDTO | UpdateLinkDTO) => Promise<void>;
  onCancel: () => void;
}

export default function LinkForm({ link, categories, onSubmit, onCancel }: LinkFormProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [icon, setIcon] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (link) {
      setTitle(link.title);
      setUrl(link.url);
      setDescription(link.description);
      setCategory(link.category);
      setTags(link.tags);
      setIcon(link.icon);
    }
  }, [link]);

  // Auto-fetch favicon when URL changes
  useEffect(() => {
    if (url && !icon && !link) {
      try {
        const domain = new URL(url).hostname;
        setIcon(`https://www.google.com/s2/favicons?domain=${domain}&sz=64`);
      } catch {}
    }
  }, [url, icon, link]);

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];
    if (!title.trim()) errs.push('Le titre est requis');
    if (!url.trim()) errs.push("L'URL est requise");
    else {
      try { new URL(url); } catch { errs.push("L'URL n'est pas valide"); }
    }
    const finalCategory = newCategory.trim() || category;
    if (!finalCategory) errs.push('La catégorie est requise');

    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        url: url.trim(),
        description: description.trim(),
        category: finalCategory,
        tags,
        icon: icon.trim(),
      });
    } catch {
      setErrors(['Erreur lors de la sauvegarde']);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errors.length > 0 && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          {errors.map((err, i) => (
            <p key={i} className="text-sm text-red-600 dark:text-red-400">{err}</p>
          ))}
        </div>
      )}

      <div>
        <label className={labelClass}>Titre *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
          placeholder="Mon site préféré"
        />
      </div>

      <div>
        <label className={labelClass}>URL *</label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className={inputClass}
          placeholder="https://example.com"
        />
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={inputClass + " resize-none"}
          placeholder="Une description courte..."
        />
      </div>

      <div>
        <label className={labelClass}>Catégorie *</label>
        <div className="flex gap-2">
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setNewCategory(''); }}
            className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all"
          >
            <option value="">-- Choisir --</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <span className="self-center text-gray-400 dark:text-gray-500 text-sm">ou</span>
          <input
            type="text"
            value={newCategory}
            onChange={(e) => { setNewCategory(e.target.value); setCategory(''); }}
            className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all"
            placeholder="Nouvelle catégorie"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Tags</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); addTag(); }
            }}
            className={inputClass}
            placeholder="Ajouter un tag..."
          />
          <button
            type="button"
            onClick={addTag}
            className="px-3 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 rounded-lg text-sm"
              >
                {tag}
                <button type="button" onClick={() => removeTag(tag)}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className={labelClass}>Icône (URL)</label>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className={inputClass}
            placeholder="https://example.com/favicon.ico"
          />
          <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center flex-shrink-0">
            {icon ? (
              <img src={icon} alt="" className="w-7 h-7 object-contain" onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }} />
            ) : (
              <Globe className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-2.5 gradient-bg text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {submitting ? 'Enregistrement...' : link ? 'Modifier' : 'Ajouter'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
