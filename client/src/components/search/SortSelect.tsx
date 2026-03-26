import { ArrowUpDown } from 'lucide-react';

interface SortSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const options = [
  { value: '', label: 'Par défaut' },
  { value: 'clicks', label: 'Plus cliqués' },
  { value: 'newest', label: 'Plus récents' },
  { value: 'oldest', label: 'Plus anciens' },
  { value: 'title', label: 'Alphabétique' },
];

export default function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <div className="relative inline-flex items-center">
      <ArrowUpDown className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 transition-all cursor-pointer appearance-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
