import React, { useState } from 'react';
import { format } from 'date-fns';
import { Mic, Keyboard } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { useLocalStorage } from '../hooks/useLocalStorage';

export function Dashboard({ userRole }) {
  const [entries, setEntries] = useLocalStorage('symptom_entries', []);
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState(5);
  const [category, setCategory] = useState('Other');
  const [inputMode, setInputMode] = useState('voice');
  const [isSaved, setIsSaved] = useState(false);

  const categories = [
    { value: 'Pain', label: 'Pain' },
    { value: 'Fatigue', label: 'Fatigue' },
    { value: 'Nausea', label: 'Nausea' },
    { value: 'Headache', label: 'Headache' },
    { value: 'Dizziness', label: 'Dizziness' },
    { value: 'Sleep Issues', label: 'Sleep Issues' },
    { value: 'Appetite Changes', label: 'Appetite Changes' },
    { value: 'Mood Changes', label: 'Mood Changes' },
    { value: 'Breathing', label: 'Breathing Difficulty' },
    { value: 'Other', label: 'Other' },
  ];

  const severityOptions = Array.from({ length: 10 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1} - ${i === 0 ? 'Mild' : i === 9 ? 'Severe' : ''}`,
  }));

  const handleSave = () => {
    if (!description.trim()) return;

    const newEntry = {
      id: uuidv4(),
      date: new Date().toISOString(),
      description,
      severity,
      category,
      userRole: userRole || 'patient',
      createdAt: Date.now(),
    };

    setEntries((prev) => [newEntry, ...prev]);
    setIsSaved(true);

    setTimeout(() => {
      setDescription('');
      setSeverity(5);
      setCategory('Other');
      setIsSaved(false);
      setInputMode('voice');
    }, 2000);
  };

  const greeting =
    userRole === 'patient'
      ? 'How are you feeling today?'
      : 'How are they doing today?';

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 mb-2">
          {greeting}
        </h1>
        <p className="text-stone-500">
          {format(new Date(), 'EEEE, MMMM do, yyyy')}
        </p>
      </header>

      <Card className="overflow-hidden">
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={() => setInputMode('voice')}
            className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              inputMode === 'voice'
                ? 'bg-emerald-100 text-emerald-700'
                : 'text-stone-500 hover:bg-stone-100'
            }`}
          >
            <Mic className="w-4 h-4 mr-2" />
            Voice Entry
          </button>

          <button
            onClick={() => setInputMode('text')}
            className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              inputMode === 'text'
                ? 'bg-emerald-100 text-emerald-700'
                : 'text-stone-500 hover:bg-stone-100'
            }`}
          >
            <Keyboard className="w-4 h-4 mr-2" />
            Text Entry
          </button>
        </div>

        <div className="min-h-[200px] flex flex-col justify-center">
          {inputMode === 'voice' ? (
            <VoiceRecorder
              onTranscriptChange={setDescription}
              initialValue={description}
            />
          ) : (
            <Textarea
              label="Describe symptoms"
              placeholder="Type details here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-40 text-lg"
            />
          )}
        </div>

        {inputMode === 'voice' && description && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Transcript (Edit if needed)
            </label>
            <textarea
              className="w-full p-3 rounded-lg border border-stone-200 text-stone-700 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Select
            label="Category"
            options={categories}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <Select
            label="Severity (1-10)"
            options={severityOptions}
            value={severity}
            onChange={(e) => setSeverity(Number(e.target.value))}
          />
        </div>

        <div className="mt-8">
          <Button
            onClick={handleSave}
            className="w-full"
            size="lg"
            disabled={!description.trim()}
          >
            {isSaved ? 'Entry Saved!' : 'Save Entry'}
          </Button>
        </div>
      </Card>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-stone-900">
            Recent Entries
          </h2>
          <span className="text-sm text-emerald-600 font-medium cursor-pointer">
            View all
          </span>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-8 bg-stone-50 rounded-lg border border-stone-100 border-dashed">
            <p className="text-stone-500">
              No entries yet. Start by recording how you feel.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.slice(0, 3).map((entry) => (
              <div
                key={entry.id}
                className="bg-white p-4 rounded-lg border border-stone-100 shadow-sm flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-stone-900">
                    {entry.category}
                  </p>
                  <p className="text-sm text-stone-500 truncate max-w-[200px]">
                    {entry.description}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-stone-400 block">
                    {format(new Date(entry.createdAt), 'h:mm a')}
                  </span>
                  <span className="inline-block px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-xs mt-1">
                    Sev: {entry.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
