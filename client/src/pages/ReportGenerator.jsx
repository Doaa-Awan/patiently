import React, { useState } from 'react';
import { format, subDays } from 'date-fns';
import { Download, Copy, Check, Sparkles } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';

export function ReportGenerator() {
  const [entries] = useLocalStorage('symptom_entries', []);
  const [timeRange, setTimeRange] = useState('7');
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState(null);
  const [copied, setCopied] = useState(false);

  const generateReport = () => {
    setIsGenerating(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const days = parseInt(timeRange, 10);
      const cutoffDate = subDays(new Date(), days);

      const relevantEntries = entries.filter(
        (e) => new Date(e.date) >= cutoffDate
      );

      const startDate = format(cutoffDate, 'MMM d');
      const endDate = format(new Date(), 'MMM d');
      const totalEntries = relevantEntries.length;

      if (totalEntries === 0) {
        setReport('No symptoms were recorded during this period.');
        setIsGenerating(false);
        return;
      }

      const categories = [
        ...new Set(relevantEntries.map((e) => e.category)),
      ];

      const avgSeverity = (
        relevantEntries.reduce((acc, curr) => acc + curr.severity, 0) /
        totalEntries
      ).toFixed(1);

      const highestSeverityEntry = [...relevantEntries].sort(
        (a, b) => b.severity - a.severity
      )[0];

      const summary = `
PATIENT SYMPTOM SUMMARY REPORT
Period: ${startDate} - ${endDate} (${days} days)
Total Entries: ${totalEntries}

OVERVIEW:
The patient reported symptoms primarily related to ${categories.join(
        ', '
      )}. The average severity recorded was ${avgSeverity}/10.

KEY OBSERVATIONS:
- Most frequent symptom: ${categories[0]}
- Highest severity recorded: ${highestSeverityEntry.severity}/10 on ${format(
        new Date(highestSeverityEntry.date),
        'MMM d'
      )}
- Symptom frequency: ${Math.round((totalEntries / days) * 10) / 10} entries per day average.

DETAILED TIMELINE:
${relevantEntries
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        .map(
          (e) =>
            `- ${format(
              new Date(e.date),
              'MM/dd h:mm a'
            )}: ${e.category} (Severity ${e.severity}/10) - "${e.description}"`
        )
        .join('\n')}
      `.trim();

      setReport(summary);
      setIsGenerating(false);
    }, 1500);
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
            isLoading={isGenerating}
            className="w-full md:w-auto"
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Generate AI Summary
          </Button>
        </div>
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

          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm font-mono text-sm leading-relaxed whitespace-pre-wrap text-stone-700">
            {report}
          </div>
        </div>
      )}
    </div>
  );
}
