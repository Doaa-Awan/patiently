import React, { useState, useEffect } from 'react';
import { TimelineEntry } from '../components/TimelineEntry';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import { useLocalStorage } from '../hooks/useLocalStorage';

export function Timeline() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient] = useLocalStorage('selected_patient', null);
  const [patientId, setPatientId] = useState(null);

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

  // Sort entries by date (newest first)
  const sorted = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 mb-2">Timeline</h1>
        <p className="text-stone-500">A chronological view of recorded entries</p>
      </header>

      {isLoading ? (
        <div className="text-center py-8 bg-stone-50 rounded-lg border border-stone-100 border-dashed">
          <p className="text-stone-500">Loading entries...</p>
        </div>
      ) : sorted.length === 0 ? (
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
