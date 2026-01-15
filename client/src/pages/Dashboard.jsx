import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Mic, Keyboard, ArrowLeft, Users } from 'lucide-react';

import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Card } from '../components/ui/Card';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import { useLocalStorage } from '../hooks/useLocalStorage';

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState(5);
  const [category, setCategory] = useState('Other');
  const [inputMode, setInputMode] = useState('voice');
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormatting, setIsFormatting] = useState(false);
  const [selectedPatient] = useLocalStorage('selected_patient', null);
  const [patientId, setPatientId] = useState(null);
  const [hasPatients, setHasPatients] = useState(false);
  const [expandedEntries, setExpandedEntries] = useState({});

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

  const severityOptions = [
    { value: 1, label: '1 - Very Mild' },
    { value: 2, label: '2 - Minor' },
    { value: 3, label: '3 - Noticeable' },
    { value: 4, label: '4 - Moderate' },
    { value: 5, label: '5 - Moderately Strong' },
    { value: 6, label: '6 - Moderately Stronger' },
    { value: 7, label: '7 - Severe' },
    { value: 8, label: '8 - Intense' },
    { value: 9, label: '9 - Excruciating' },
    { value: 10, label: '10 - Worst' },
  ];

  // const severityOptions = Array.from({ length: 10 }, (_, i) => ({
  //   value: i + 1,
  //   label: `${i + 1} - ${i === 0 ? 'Mild' : i === 9 ? 'Severe' : ''}`,
  // }));

  // Map API response to frontend format
  const mapApiEntryToFrontend = (apiEntry) => {
    return {
      id: apiEntry._id,
      date: apiEntry.startTime,
      description: apiEntry.symptom,
      severity: apiEntry.severity,
      category: apiEntry.category || 'Other',
      userRole: user?.role || 'patient',
      createdAt: apiEntry.startTime ? new Date(apiEntry.startTime).getTime() : apiEntry.createdAt ? new Date(apiEntry.createdAt).getTime() : Date.now(),
    };
  };

  // Check if caregiver has patients available
  useEffect(() => {
    const checkPatients = async () => {
      if (user?.role === 'caregiver') {
        try {
          const result = await api.getAllUsers('patient');
          if (result.success && result.data && result.data.length > 0) {
            setHasPatients(true);
          } else {
            setHasPatients(false);
          }
        } catch (error) {
          console.error('Error checking patients:', error);
          setHasPatients(false);
        }
      }
    };

    checkPatients();
  }, [user]);

  // Determine patient ID based on user role and selected patient
  useEffect(() => {
    if (!user) return;

    if (user.role === 'patient') {
      // Patients use their own ID
      setPatientId(user._id);
    } else if (user.role === 'caregiver') {
      // Caregivers can select a patient
      if (selectedPatient?.id && /^[0-9a-fA-F]{24}$/.test(selectedPatient.id)) {
        setPatientId(selectedPatient.id);
      } else {
        // If no patient selected, try to get first patient
        const fetchFirstPatient = async () => {
          try {
            const result = await api.getAllUsers('patient');
            if (result.success && result.data && result.data.length > 0) {
              setPatientId(result.data[0]._id);
            } else {
              setPatientId(null);
            }
          } catch (error) {
            console.error('Error fetching patients:', error);
            setPatientId(null);
          }
        };
        fetchFirstPatient();
      }
    }
  }, [user, selectedPatient]);

  // Fetch entries from API
  useEffect(() => {
    if (!patientId || !user) {
      setIsLoading(false);
      setEntries([]);
      return;
    }

    const fetchEntries = async () => {
      setIsLoading(true);
      try {
        const result = await api.getPatientSymptoms(patientId);
        
        if (result.success && result.data) {
          const mappedEntries = result.data.map(mapApiEntryToFrontend);
          setEntries(mappedEntries);
        } else {
          setEntries([]);
        }
      } catch (error) {
        console.error('Error fetching entries:', error);
        setEntries([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, [patientId, user]);

  const handleSave = async () => {
    if (!description.trim()) return;

    if (!patientId) {
      alert('No patient selected. Please select a patient first.');
      return;
    }

    if (!user) {
      alert('You must be logged in to save entries.');
      return;
    }

    try {
      let formattedSymptom = description;
      const originalTranscript = description;

      // If voice input, format the transcript using AI
      if (inputMode === 'voice' && description.trim()) {
        try {
          setIsFormatting(true);
          const aiResponse = await api.formatTranscript(description);
          
          if (aiResponse.choices && aiResponse.choices[0] && aiResponse.choices[0].message) {
            formattedSymptom = aiResponse.choices[0].message.content.trim();
            // Update the description field to show the formatted version
            setDescription(formattedSymptom);
          } else if (aiResponse.error) {
            console.warn('AI formatting failed, using original transcript:', aiResponse.error);
            // Continue with original transcript if AI fails
          }
        } catch (error) {
          console.error('Error formatting transcript with AI:', error);
          // Continue with original transcript if AI fails
        } finally {
          setIsFormatting(false);
        }
      }

      const symptomData = {
        symptom: formattedSymptom,
        severity: severity,
        category: category,
        startTime: new Date().toISOString(),
        notes: inputMode === 'voice' ? `Original transcript: ${originalTranscript}` : formattedSymptom,
      };

      // Only include patient ID if user is a caregiver
      if (user.role === 'caregiver') {
        symptomData.patient = patientId;
      }
      // If user is a patient, the backend will use their own ID

      const result = await api.createSymptom(symptomData);

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
    user?.role === 'patient'
      ? 'How are you feeling today?'
      : 'How are they doing today?';

  const toggleEntryExpansion = (entryId) => {
    setExpandedEntries((prev) => ({
      ...prev,
      [entryId]: !prev[entryId],
    }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header className="mb-8">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-stone-900 mb-2">
              {greeting}
            </h1>
            <p className="text-stone-500">
              {format(new Date(), 'EEEE, MMMM do, yyyy')}
            </p>
          </div>
          {user?.role === 'caregiver' && hasPatients && (
            <div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/patients')}
                leftIcon={<Users className="w-4 h-4" />}
                className="ml-4"
              >
                All Patients
              </Button>
            </div>
          )}
        </div>
        {user?.role === 'caregiver' && selectedPatient && (
          <div className="mt-2 flex items-center gap-2">
            <ArrowLeft 
              className="w-4 h-4 text-stone-400 cursor-pointer hover:text-stone-600"
              onClick={() => navigate('/patients')}
            />
            <span className="text-sm text-stone-600">
              Recording for: <span className="font-medium text-stone-900">{selectedPatient.name}</span>
            </span>
          </div>
        )}
      </header>

      <Card>
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
            label="Main Symptom"
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
            disabled={!description.trim() || isFormatting}
            isLoading={isFormatting}
          >
            {isFormatting 
              ? 'Formatting with AI...' 
              : isSaved 
                ? 'Entry Saved!' 
                : 'Save Entry'}
          </Button>
        </div>
      </Card>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-stone-900">
            Recent Entries
          </h2>
          <span className="text-sm text-emerald-600 font-medium cursor-pointer" onClick={() => navigate('/timeline')}>
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
            {entries.slice(0, 3).map((entry) => {
              const isExpanded = Boolean(expandedEntries[entry.id]);
              const shouldShowToggle =
                entry.description && entry.description.length > 120;

              return (
                <div
                  key={entry.id}
                  className="bg-white p-4 rounded-lg border border-stone-100 shadow-sm flex justify-between items-start text-left gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-stone-900">
                      {entry.category}
                    </p>
                    <p
                      className={`text-sm text-stone-500 whitespace-pre-wrap break-words overflow-hidden transition-[max-height] duration-200 ${
                        isExpanded ? 'max-h-none' : 'max-h-10'
                      }`}
                    >
                      {entry.description}
                    </p>
                    {shouldShowToggle && (
                      <button
                        type="button"
                        className="mt-2 text-xs font-medium text-emerald-600 hover:text-emerald-700"
                        onClick={() => toggleEntryExpansion(entry.id)}
                      >
                        {isExpanded ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs text-stone-400 block">
                      {format(new Date(entry.createdAt), 'h:mm a')}
                    </span>
                    <span className="inline-block px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-xs mt-1">
                      Sev: {entry.severity}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
