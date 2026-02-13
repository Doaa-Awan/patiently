import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/Card';
import { format } from 'date-fns';
import { Activity } from 'lucide-react';
import { Select } from './ui/Select';
import { Textarea } from './ui/Input';
import { Markdown } from './Markdown';

export function TimelineEntry({
  entry,
  index,
  onUpdateEntry,
  onDeleteEntry,
  isUpdatingEntry,
  isDeletingEntry,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editDescription, setEditDescription] = useState(entry.description);
  const [editSeverity, setEditSeverity] = useState(entry.severity);
  const [editCategory, setEditCategory] = useState(entry.category);

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

  const startEdit = () => {
    setIsEditing(true);
    setEditDescription(entry.description);
    setEditSeverity(entry.severity);
    setEditCategory(entry.category);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditDescription(entry.description);
    setEditSeverity(entry.severity);
    setEditCategory(entry.category);
  };

  const saveEdit = () => {
    if (!editDescription.trim()) {
      alert('Description cannot be empty.');
      return;
    }
    onUpdateEntry(entry.id, {
      symptom: editDescription.trim(),
      severity: editSeverity,
      category: editCategory,
    });
    setIsEditing(false);
  };

  const deleteEntry = () => {
    onDeleteEntry(entry.id);
  };

  const getSeverityColor = (level) => {
    if (level <= 3) return 'bg-emerald-100 text-emerald-800';
    if (level <= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="mb-4"
    >
      <Card className="relative overflow-hidden border-l-4 border-l-emerald-500">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              {format(new Date(entry.date), 'MMM d, yyyy')}
            </span>
            <span className="text-stone-300">-</span>
            <span className="text-xs text-stone-500">
              {format(new Date(entry.createdAt), 'h:mm a')}
            </span>
          </div>

          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
              isEditing ? editSeverity : entry.severity
            )}`}
          >
            Severity: {isEditing ? editSeverity : entry.severity}/10
          </span>
        </div>

        <div className="mb-3">
          <h3 className="text-lg font-semibold text-stone-900 flex items-center">
            {isEditing ? editCategory : entry.category}
          </h3>
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <Textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Category"
                options={categories}
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
              />
              <Select
                label="Severity"
                options={severityOptions}
                value={editSeverity}
                onChange={(e) => setEditSeverity(Number(e.target.value))}
              />
            </div>
          </div>
        ) : (
          <Markdown>{entry.description}</Markdown>
        )}

        <div className="mt-4 pt-3 border-t border-stone-100 flex justify-between items-center">
          <span className="text-xs text-stone-400 capitalize flex items-center">
            <Activity className="w-3 h-3 mr-1" />
            Logged by {entry.userRole}
          </span>
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  type="button"
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
                  onClick={saveEdit}
                  disabled={isUpdatingEntry}
                >
                  {isUpdatingEntry ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  className="text-xs font-medium text-stone-500 hover:text-stone-700"
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="text-xs font-medium text-stone-600 hover:text-stone-800"
                  onClick={startEdit}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                  onClick={deleteEntry}
                  disabled={isDeletingEntry}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
