'use client';

import { useState } from 'react';
import { usePageContext } from '@/hooks/usePageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Download,
  FileText,
  FileSpreadsheet,
  Users,
  Briefcase,
  MessageSquare,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';

type ReportType = 'deals' | 'buyers' | 'communications' | 'markets' | 'custom';
type ExportFormat = 'csv' | 'json' | 'pdf';
type DateRange = 7 | 30 | 90 | 365;

const reportTemplates: {
  type: ReportType;
  name: string;
  description: string;
  icon: React.ReactNode;
  metrics: string[];
}[] = [
  {
    type: 'deals',
    name: 'Deal Performance',
    description: 'Pipeline metrics, conversion rates, and revenue',
    icon: <Briefcase className="h-5 w-5" />,
    metrics: ['total_deals', 'closed_deals', 'revenue', 'conversion_rate', 'avg_days_to_close'],
  },
  {
    type: 'buyers',
    name: 'Buyer Network',
    description: 'Buyer engagement and acquisition metrics',
    icon: <Users className="h-5 w-5" />,
    metrics: ['total_buyers', 'active_buyers', 'tier_distribution', 'response_rate', 'purchases'],
  },
  {
    type: 'communications',
    name: 'Communication Summary',
    description: 'Channel performance and response rates',
    icon: <MessageSquare className="h-5 w-5" />,
    metrics: ['emails_sent', 'sms_sent', 'calls_made', 'response_rate', 'avg_response_time'],
  },
  {
    type: 'markets',
    name: 'Market Analysis',
    description: 'Market trends and opportunity scores',
    icon: <MapPin className="h-5 w-5" />,
    metrics: ['active_markets', 'avg_price', 'price_trend', 'opportunities', 'properties'],
  },
];

export default function ReportsPage() {
  usePageContext('analytics-reports');
  const [selectedTemplate, setSelectedTemplate] = useState<ReportType | null>(null);
  const [reportName, setReportName] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>(30);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    if (!selectedTemplate) return;

    setIsExporting(true);
    try {
      const url = `/api/analytics/export?format=${format}&type=${selectedTemplate}&days=${dateRange}`;
      window.open(url, '_blank');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center gap-4">
          <Link href="/analytics" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="page-title">Report Builder</h1>
            <p className="page-description">Create and export custom analytics reports</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Templates */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Report Templates</CardTitle>
              <CardDescription>Select a template to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportTemplates.map((template) => (
                  <button
                    key={template.type}
                    onClick={() => {
                      setSelectedTemplate(template.type);
                      setReportName(template.name);
                    }}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      selectedTemplate === template.type
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`p-2 rounded-lg ${
                          selectedTemplate === template.type
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {template.icon}
                      </div>
                      <h3 className="font-medium">{template.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.metrics.slice(0, 3).map((metric) => (
                        <span key={metric} className="text-xs px-2 py-0.5 bg-muted rounded">
                          {metric.replace(/_/g, ' ')}
                        </span>
                      ))}
                      {template.metrics.length > 3 && (
                        <span className="text-xs px-2 py-0.5 bg-muted rounded">
                          +{template.metrics.length - 3} more
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Configuration */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Report Settings</CardTitle>
              <CardDescription>Configure and export your report</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="report-name">Report Name</Label>
                <Input
                  id="report-name"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="Enter report name"
                />
              </div>

              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="grid grid-cols-4 gap-2">
                  {([7, 30, 90, 365] as DateRange[]).map((days) => (
                    <Button
                      key={days}
                      variant={dateRange === days ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setDateRange(days)}
                    >
                      {days === 7 ? '7D' : days === 30 ? '30D' : days === 90 ? '90D' : '1Y'}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <Label>Export Format</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('csv')}
                    disabled={!selectedTemplate || isExporting}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-1" />
                    CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('json')}
                    disabled={!selectedTemplate || isExporting}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('pdf')}
                    disabled={!selectedTemplate || isExporting}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                </div>
              </div>

              {!selectedTemplate && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Select a template to configure your report
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
