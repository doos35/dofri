import { useState, useRef, DragEvent } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2, X } from 'lucide-react';
import * as api from '../../api/linksApi';

interface ImportLinksProps {
  onDone: () => void;
  onCancel: () => void;
}

interface ParsedLink {
  title: string;
  url: string;
  category: string;
  description?: string;
  tags?: string[];
  icon?: string;
}

export default function ImportLinks({ onDone, onCancel }: ImportLinksProps) {
  const [dragging, setDragging] = useState(false);
  const [parsed, setParsed] = useState<ParsedLink[] | null>(null);
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ created: number; skipped: number; errors: string[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): ParsedLink[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) throw new Error('Le CSV doit contenir un en-tête et au moins une ligne');

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const titleIdx = headers.indexOf('title');
    const urlIdx = headers.indexOf('url');
    const catIdx = headers.indexOf('category');
    const descIdx = headers.indexOf('description');
    const tagsIdx = headers.indexOf('tags');
    const iconIdx = headers.indexOf('icon');

    if (titleIdx === -1 || urlIdx === -1 || catIdx === -1) {
      throw new Error('Colonnes requises : title, url, category');
    }

    return lines.slice(1).filter(l => l.trim()).map(line => {
      const cols = line.split(',').map(c => c.trim());
      return {
        title: cols[titleIdx],
        url: cols[urlIdx],
        category: cols[catIdx],
        description: descIdx >= 0 ? cols[descIdx] : '',
        tags: tagsIdx >= 0 && cols[tagsIdx] ? cols[tagsIdx].split('|').map(t => t.trim()) : [],
        icon: iconIdx >= 0 ? cols[iconIdx] : '',
      };
    });
  };

  const processFile = async (file: File) => {
    setError('');
    setParsed(null);
    setResult(null);

    try {
      const text = await file.text();

      if (file.name.endsWith('.json')) {
        const json = JSON.parse(text);
        const arr = Array.isArray(json) ? json : json.links;
        if (!Array.isArray(arr)) throw new Error('Format JSON invalide — attendu un tableau ou { links: [...] }');
        setParsed(arr as ParsedLink[]);
      } else if (file.name.endsWith('.csv')) {
        setParsed(parseCSV(text));
      } else {
        setError('Format non supporté. Utilisez un fichier .json ou .csv');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur de lecture du fichier');
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleImport = async () => {
    if (!parsed) return;
    setImporting(true);
    try {
      const res = await api.importLinks(parsed);
      setResult(res);
    } catch {
      setError("Erreur lors de l'import");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Drop zone */}
      {!parsed && !result && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
            dragging
              ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/20'
              : 'border-gray-200 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
          }`}
        >
          <Upload className="w-10 h-10 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-1">
            Glissez un fichier ici ou cliquez pour parcourir
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Formats acceptés : JSON, CSV
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".json,.csv"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Preview */}
      {parsed && !result && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {parsed.length} lien{parsed.length > 1 ? 's' : ''} détecté{parsed.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="max-h-60 overflow-y-auto border border-gray-100 dark:border-gray-700 rounded-xl divide-y divide-gray-50 dark:divide-gray-700/50">
            {parsed.map((link, i) => (
              <div key={i} className="px-4 py-2.5 text-sm flex items-center gap-3">
                <span className="text-xs text-gray-400 dark:text-gray-500 w-6">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-gray-800 dark:text-gray-200 truncate">{link.title}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{link.url}</p>
                </div>
                <span className="text-xs px-2 py-0.5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-md flex-shrink-0">
                  {link.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">
              {result.created} lien{result.created > 1 ? 's' : ''} importé{result.created > 1 ? 's' : ''}
              {result.skipped > 0 && `, ${result.skipped} ignoré${result.skipped > 1 ? 's' : ''}`}
            </span>
          </div>
          {result.errors.length > 0 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mb-1">Détails :</p>
              {result.errors.map((e, i) => (
                <p key={i} className="text-xs text-amber-600 dark:text-amber-400">• {e}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {parsed && !result && (
          <button
            onClick={handleImport}
            disabled={importing}
            className="flex-1 py-2.5 gradient-bg text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {importing ? 'Import en cours...' : `Importer ${parsed.length} lien${parsed.length > 1 ? 's' : ''}`}
          </button>
        )}
        {result && (
          <button
            onClick={onDone}
            className="flex-1 py-2.5 gradient-bg text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
          >
            Fermer
          </button>
        )}
        {!result && (
          <button
            onClick={parsed ? () => { setParsed(null); setError(''); } : onCancel}
            className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {parsed ? 'Changer de fichier' : 'Annuler'}
          </button>
        )}
      </div>

      {/* Format guide */}
      {!parsed && !result && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-xs text-gray-500 dark:text-gray-400 space-y-2">
          <p className="font-medium text-gray-600 dark:text-gray-300">Formats attendus :</p>
          <div>
            <p className="font-medium">JSON :</p>
            <code className="block mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-[11px]">
              {'[{ "title": "...", "url": "...", "category": "...", "tags": ["a","b"] }]'}
            </code>
          </div>
          <div>
            <p className="font-medium">CSV :</p>
            <code className="block mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-[11px]">
              title,url,category,description,tags<br/>
              Mon site,https://...,Streaming,,tag1|tag2
            </code>
          </div>
        </div>
      )}
    </div>
  );
}
