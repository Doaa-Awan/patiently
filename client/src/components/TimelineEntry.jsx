import React from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/Card';
import { format } from 'date-fns';
import { Activity } from 'lucide-react';

export function TimelineEntry({ entry, index }) {
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
            <span className="text-stone-300">•</span>
            <span className="text-xs text-stone-500">
              {format(new Date(entry.createdAt), 'h:mm a')}
            </span>
          </div>

          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
              entry.severity
            )}`}
          >
            Severity: {entry.severity}/10
          </span>
        </div>

        <div className="mb-3">
          <h3 className="text-lg font-semibold text-stone-900 flex items-center">
            {entry.category}
          </h3>
        </div>

        <p className="text-stone-600 text-sm leading-relaxed">
          {entry.description}
        </p>

        <div className="mt-4 pt-3 border-t border-stone-100 flex justify-between items-center">
          <span className="text-xs text-stone-400 capitalize flex items-center">
            <Activity className="w-3 h-3 mr-1" />
            Logged by {entry.userRole}
          </span>
        </div>
      </Card>
    </motion.div>
  );
}
