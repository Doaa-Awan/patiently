import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';

export function Patients() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [, setSelectedPatient] = useLocalStorage('selected_patient', null);
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Fetch patients from database
  useEffect(() => {
    const fetchPatients = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Only caregivers should see the patients list
      if (user.role !== 'caregiver') {
        setIsLoading(false);
        setError('Only caregivers can view the patients list.');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await api.getAllUsers('patient');
        
        if (result.success && result.data) {
          setPatients(result.data);
        } else {
          setError(result.message || 'Failed to fetch patients');
        }
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Failed to load patients. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, [user]);

  const handleSelect = (patient) => {
    // Store patient with MongoDB _id
    setSelectedPatient({
      id: patient._id,
      name: patient.name,
      email: patient.email,
    });
    navigate('/dashboard');
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-8">
          <p className="text-stone-500">Please log in to view patients.</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'caregiver') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-8">
          <p className="text-stone-500">Only caregivers can view the patients list.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-stone-900 mb-2">Select a patient</h1>
        <p className="text-stone-500">Choose which patient you want to record symptoms for.</p>
      </header>

      {isLoading ? (
        <div className="text-center py-8 bg-stone-50 rounded-lg border border-stone-100 border-dashed">
          <p className="text-stone-500">Loading patients...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-600">{error}</p>
        </div>
      ) : patients.length === 0 ? (
        <div className="text-center py-8 bg-stone-50 rounded-lg border border-stone-100 border-dashed">
          <p className="text-stone-500">No patients found. Patients will appear here once they register.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {patients.map((patient) => {
            const age = calculateAge(patient.patientInfo?.dateOfBirth);
            const conditions = patient.patientInfo?.conditions || [];
            
            return (
              <Card
                key={patient._id}
                onClick={() => handleSelect(patient)}
                className="cursor-pointer hover:border-emerald-500 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-lg font-medium text-stone-900">{patient.name}</div>
                    <div className="text-sm text-stone-500">
                      {age !== null ? `${age} yrs` : 'Age not specified'}
                      {conditions.length > 0 && ` • ${conditions.length} condition${conditions.length > 1 ? 's' : ''}`}
                    </div>
                    {patient.patientInfo?.emergencyContact && (
                      <div className="text-xs text-stone-400 mt-1">
                        Emergency: {patient.patientInfo.emergencyContact.name} ({patient.patientInfo.emergencyContact.relationship})
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-emerald-600 font-medium ml-4">Select</div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
