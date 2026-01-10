import React from 'react';
import { TimelineEntry } from '../components/TimelineEntry';
import { useLocalStorage } from '../hooks/useLocalStorage';

export function Timeline() {
  const [entries] = useLocalStorage('symptom_entries', []);

  const sorted = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 mb-2">Timeline</h1>
        <p className="text-stone-500">A chronological view of recorded entries</p>
      </header>

      {sorted.length === 0 ? (
        <div className="text-center py-8 bg-stone-50 rounded-lg border border-stone-100 border-dashed">
          <p className="text-stone-500">No timeline entries yet. Record a symptom to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((entry, i) => (
            <TimelineEntry key={entry.id} entry={entry} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
