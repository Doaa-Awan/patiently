import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, AlertCircle } from 'lucide-react';
import { useVoiceRecording } from '../hooks/useVoiceRecording';
import { Button } from './ui/Button';

export function VoiceRecorder({ onTranscriptChange, initialValue = '' }) {
  const {
    isRecording,
    transcript,
    error,
    startRecording,
    stopRecording,
    isSupported,
  } = useVoiceRecording();

  useEffect(() => {
    if (transcript) {
      onTranscriptChange(transcript);
    }
  }, [transcript, onTranscriptChange]);

  if (!isSupported) {
    return (
      <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 flex items-center text-stone-600 text-sm">
        <AlertCircle className="w-4 h-4 mr-2" />
        Voice recording is not supported in this browser. Please type your
        entry.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div className="relative">
        {/* Pulsing rings animation */}
        <AnimatePresence>
          {isRecording && (
            <>
              <motion.div
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 2, opacity: 0 }}
                exit={{ scale: 1, opacity: 0 }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: 'easeOut',
                }}
                className="absolute inset-0 bg-emerald-200 rounded-full"
              />

              <motion.div
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.5, opacity: 0 }}
                exit={{ scale: 1, opacity: 0 }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  delay: 0.5,
                  ease: 'easeOut',
                }}
                className="absolute inset-0 bg-emerald-300 rounded-full"
              />
            </>
          )}
        </AnimatePresence>

        {/* Main recording button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={isRecording ? stopRecording : startRecording}
          className={`
            relative z-10 flex items-center justify-center w-20 h-20 rounded-full shadow-lg transition-colors
            ${
              isRecording
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }
          `}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          {isRecording ? (
            <Square className="w-8 h-8 fill-current" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </motion.button>
      </div>

      <div className="mt-4 text-center">
        <p
          className={`text-sm font-medium ${
            isRecording
              ? 'text-red-500 animate-pulse'
              : 'text-stone-500'
          }`}
        >
          {isRecording ? 'Listening...' : 'Tap to record your symptoms'}
        </p>

        {error && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}
      </div>
    </div>
  );
}
