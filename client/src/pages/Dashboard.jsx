import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Mic, Keyboard } from 'lucide-react';

import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { useLocalStorage } from '../hooks/useLocalStorage';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function Dashboard({ userRole }) {
  const [entries, setEntries] = useState([]);
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState(5);
  const [category, setCategory] = useState('Other');
  const [inputMode, setInputMode] = useState('voice');
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient] = useLocalStorage('selected_patient', null);
  const [patientId, setPatientId] = useState(null);

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

  // Map API response to frontend format
  const mapApiEntryToFrontend = (apiEntry) => {
    return {
      id: apiEntry._id,
      date: apiEntry.startTime,
      description: apiEntry.symptom,
      severity: apiEntry.severity,
      category: apiEntry.category || 'Other',
      userRole: userRole || 'patient',
      createdAt: apiEntry.startTime ? new Date(apiEntry.startTime).getTime() : apiEntry.createdAt ? new Date(apiEntry.createdAt).getTime() : Date.now(),
    };
  };

  // Fetch or get patient ID
  useEffect(() => {
    const getPatientId = async () => {
      try {
        // If we have a selected patient with a valid MongoDB ObjectId, use it
        if (selectedPatient?.id && /^[0-9a-fA-F]{24}$/.test(selectedPatient.id)) {
          setPatientId(selectedPatient.id);
          return;
        }

        // Otherwise, try to get the first patient from the database
        const usersResponse = await fetch(`${API_BASE}/api/users?role=patient&limit=1`);
        const usersResult = await usersResponse.json();
        
        if (usersResult.success && usersResult.data && usersResult.data.length > 0) {
          setPatientId(usersResult.data[0]._id);
        } else {
          // No patients exist - user needs to create one first
          console.warn('No patients found in database. Please create a patient first.');
          setPatientId(null);
        }
      } catch (error) {
        console.error('Error fetching patient:', error);
        setPatientId(null);
      }
    };

    getPatientId();
  }, [selectedPatient]);

  // Fetch entries from API
  useEffect(() => {
    if (!patientId) {
      setIsLoading(false);
      setEntries([]);
      return;
    }

    const fetchEntries = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE}/api/symptoms/getsymptoms?patientId=${patientId}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          const mappedEntries = result.data.map(mapApiEntryToFrontend);
          setEntries(mappedEntries);
        } else if (Array.isArray(result)) {
          // Fallback for old API format
          const mappedEntries = result.map(mapApiEntryToFrontend);
          setEntries(mappedEntries);
        }
      } catch (error) {
        console.error('Error fetching entries:', error);
        // Keep entries as empty array on error
        setEntries([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, [patientId, userRole]);

  const handleSave = async () => {
    if (!description.trim()) return;

    if (!patientId) {
      alert('No patient selected. Please select a patient first or create one in the database.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/symptoms/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient: patientId,
          symptom: description,
          severity: severity,
          category: category,
          startTime: new Date().toISOString(),
          notes: description, // Using description as notes for now
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Server error response:', result);
        alert(`Failed to save entry: ${result.message || result.error || 'Unknown error'}`);
        return;
      }

      if (result.success && result.data) {
        const newEntry = mapApiEntryToFrontend(result.data);
        setEntries((prev) => [newEntry, ...prev]);
        setIsSaved(true);

        setTimeout(() => {
          setDescription('');
          setSeverity(5);
          setCategory('Other');
          setIsSaved(false);
          setInputMode('voice');
        }, 2000);
      } else {
        console.error('Error saving entry:', result);
        alert(`Failed to save entry: ${result.message || result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      alert(`Failed to save entry: ${error.message || 'Network error'}`);
    }
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

        {isLoading ? (
          <div className="text-center py-8 bg-stone-50 rounded-lg border border-stone-100 border-dashed">
            <p className="text-stone-500">Loading entries...</p>
          </div>
        ) : entries.length === 0 ? (
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
