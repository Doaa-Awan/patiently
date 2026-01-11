import React, { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { Download, Copy, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../utils/api';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';

// Format markdown-like text to HTML
const formatReportText = (text) => {
  if (!text) return '';

  // Split into lines for processing
  const lines = text.split('\n');
  const output = [];
  let inBulletList = false;
  let inNumberedList = false;
  let bulletItems = [];
  let numberedItems = [];

  const closeBulletList = () => {
    if (bulletItems.length > 0) {
      output.push(`<ul class="list-disc list-inside space-y-1 my-3 ml-4">${bulletItems.join('')}</ul>`);
      bulletItems = [];
      inBulletList = false;
    }
  };

  const closeNumberedList = () => {
    if (numberedItems.length > 0) {
      output.push(`<ol class="list-decimal list-inside space-y-1 my-3 ml-4">${numberedItems.join('')}</ol>`);
      numberedItems = [];
      inNumberedList = false;
    }
  };

  const closeAllLists = () => {
    closeBulletList();
    closeNumberedList();
  };

  lines.forEach((line) => {
  const trimmed = line.trim();

  // Headers
  if (trimmed.startsWith('#### ')) {
    closeAllLists();
    output.push(
      `<h4 class="text-base font-semibold text-stone-900 mt-4 mb-2">
        ${formatInlineMarkdown(trimmed.substring(5))}
      </h4>`
    );
  } else if (trimmed.startsWith('### ')) {
    closeAllLists();
    output.push(
      `<h3 class="text-lg font-semibold text-stone-900 mt-6 mb-3">
        ${formatInlineMarkdown(trimmed.substring(4))}
      </h3>`
    );
  } else if (trimmed.startsWith('## ')) {
    closeAllLists();
    output.push(
      `<h2 class="text-xl font-bold text-stone-900 mt-6 mb-3">
        ${formatInlineMarkdown(trimmed.substring(3))}
      </h2>`
    );
  } else if (trimmed.startsWith('# ')) {
    closeAllLists();
    output.push(
      `<h1 class="text-2xl font-bold text-stone-900 mt-6 mb-4">
        ${formatInlineMarkdown(trimmed.substring(2))}
      </h1>`
    );
  }

    // Bullet points
    else if (/^[\*\-\•]\s+/.test(trimmed)) {
      closeNumberedList();
      if (!inBulletList) {
        inBulletList = true;
      }
      const content = trimmed.replace(/^[\*\-\•]\s+/, '');
      bulletItems.push(`<li class="mb-1">${formatInlineMarkdown(content)}</li>`);
    }
    // Numbered lists
    else if (/^\d+\.\s+/.test(trimmed)) {
      closeBulletList();
      if (!inNumberedList) {
        inNumberedList = true;
      }
      const content = trimmed.replace(/^\d+\.\s+/, '');
      numberedItems.push(`<li class="mb-1">${formatInlineMarkdown(content)}</li>`);
    }
    // Empty line
    else if (trimmed === '') {
      closeAllLists();
    }
    // Regular paragraph
    else {
      closeAllLists();
      output.push(`<p class="mb-3 leading-relaxed">${formatInlineMarkdown(trimmed)}</p>`);
    }
  });

  closeAllLists();

  return output.join('');
};

// Format inline markdown (bold, etc.)
const formatInlineMarkdown = (text) => {
  // Convert bold text
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-stone-900">$1</strong>');
  
  // Convert italic text
  formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
  
  return formatted;
};

export function ReportGenerator() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);
  const [selectedPatient] = useLocalStorage('selected_patient', null);
  const [patientId, setPatientId] = useState(null);
  const [timeRange, setTimeRange] = useState('7');
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState(null);
  const [copied, setCopied] = useState(false);

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
      setIsLoadingEntries(false);
      setEntries([]);
      return;
    }

    const fetchEntries = async () => {
      setIsLoadingEntries(true);
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
        setIsLoadingEntries(false);
      }
    };

    fetchEntries();
  }, [patientId, user]);

  const generateReport = async () => {
    if (!entries || entries.length === 0) {
      setReport('No symptoms were recorded. Please record some symptoms first.');
      return;
    }

    setIsGenerating(true);
    setReport(null);

    try {
      const days = parseInt(timeRange, 10);
      const cutoffDate = subDays(new Date(), days);

      // Filter entries within time range
      const relevantEntries = entries.filter(
        (e) => new Date(e.date) >= cutoffDate
      );

      if (relevantEntries.length === 0) {
        setReport('No symptoms were recorded during this period.');
        setIsGenerating(false);
        return;
      }

      // Format entries for AI processing
      const formattedEntries = relevantEntries.map((entry) => ({
        date: format(new Date(entry.date), 'yyyy-MM-dd'),
        time: format(new Date(entry.date), 'HH:mm'),
        category: entry.category,
        symptom: entry.description,
        severity: entry.severity,
      }));

      // Call OpenRouter API to generate report
      const response = await api.generateReport(formattedEntries, timeRange);

      if (response.choices && response.choices[0] && response.choices[0].message) {
        const aiReport = response.choices[0].message.content;
        setReport(aiReport);
      } else if (response.error) {
        throw new Error(response.error || 'Failed to generate report');
      } else {
        throw new Error('Unexpected response format from AI service');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setReport(`Error generating report: ${error.message || 'Please try again later.'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!report) return;

    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!report) return;

    const element = document.createElement('a');
    const file = new Blob([report], { type: 'text/plain' });

    element.href = URL.createObjectURL(file);
    element.download = `health-report-${format(
      new Date(),
      'yyyy-MM-dd'
    )}.txt`;

    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900 mb-2">
          Report Generator
        </h1>
        <p className="text-stone-500">
          Create a summary for your doctor visit
        </p>
      </header>

      <Card className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <Select
            label="Time Range"
            options={[
              { value: '7', label: 'Last 7 Days' },
              { value: '14', label: 'Last 14 Days' },
              { value: '30', label: 'Last 30 Days' },
              { value: '90', label: 'Last 3 Months' },
            ]}
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          />

          <Button
            onClick={generateReport}
            disabled={isGenerating || isLoadingEntries || entries.length === 0}
            className="w-full md:w-auto"
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            {isGenerating ? 'Generating...' : 'Generate AI Summary'}
          </Button>
        </div>
        {isLoadingEntries && (
          <p className="text-sm text-stone-500 mt-2">Loading symptom entries...</p>
        )}
        {!isLoadingEntries && entries.length === 0 && (
          <p className="text-sm text-stone-500 mt-2">No symptom entries found. Record some symptoms first.</p>
        )}
        {!isLoadingEntries && entries.length > 0 && (
          <p className="text-sm text-stone-500 mt-2">
            {entries.length} symptom {entries.length === 1 ? 'entry' : 'entries'} available for report generation.
          </p>
        )}
      </Card>

      {report && (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-stone-900">
              Generated Report
            </h3>

            <div className="flex space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopy}
                leftIcon={
                  copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )
                }
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleDownload}
                leftIcon={<Download className="w-4 h-4" />}
              >
                Download
              </Button>
            </div>
          </div>

          <div 
            className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm text-base leading-relaxed text-stone-700"
            dangerouslySetInnerHTML={{ __html: formatReportText(report) }}
          />
        </div>
      )}
    </div>
  );
}
