import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Mock patients list - replace with real data as needed
const MOCK_PATIENTS = [
  { id: 'p1', name: 'Alice Johnson', relation: 'Mother', age: 72 },
  { id: 'p2', name: 'Bob Martin', relation: 'Father', age: 68 },
  { id: 'p3', name: 'Carlos Ruiz', relation: 'Son', age: 34 },
];

export function Patients() {
  const navigate = useNavigate();
  const [, setSelectedPatient] = useLocalStorage('selected_patient', null);

  const handleSelect = (patient) => {
    setSelectedPatient(patient);
    navigate('/dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-stone-900 mb-2">Select a patient</h1>
        <p className="text-stone-500">Choose which patient you want to record symptoms for.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-4">
        {MOCK_PATIENTS.map((p) => (
          <Card
            key={p.id}
            onClick={() => handleSelect(p)}
            className="cursor-pointer hover:border-emerald-500 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-medium text-stone-900">{p.name}</div>
                <div className="text-sm text-stone-500">{p.relation} • {p.age} yrs</div>
              </div>
              <div className="text-sm text-emerald-600 font-medium">Select</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
