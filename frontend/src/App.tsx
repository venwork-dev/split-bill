import { useState, useEffect } from 'react';
import { UploadZone } from '@/components/UploadZone';
import { ResultsTable } from '@/components/ResultsTable';
import { GroupsView } from '@/components/GroupsView';
import { parsePDF } from '@/utils/parsePDF';
import type { ParsedBill, UploadStatus } from '@/types/bill.types';
import { Button } from '@/components/ui/button';
import { DEMO_BILL, DEMO_GROUPS } from '@/utils/demoData';
import { useGroupStore } from '@/stores/groupStore';

type ViewMode = 'table' | 'groups';

function App() {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [parsedBill, setParsedBill] = useState<ParsedBill | null>(null);
  const [error, setError] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const { groups, setGroups } = useGroupStore();

  // Check if we're in demo mode on mount
  useEffect(() => {
    const isDemo = window.location.pathname === '/demo';
    if (isDemo) {
      setIsDemoMode(true);
      setParsedBill(DEMO_BILL);
      setGroups(DEMO_GROUPS);
      setStatus('success');
    } else {
      // Not in demo mode - clear any demo groups that might be loaded
      setIsDemoMode(false);
      const hasDemoGroups = groups.some(g => g.id.startsWith('demo-group-'));
      if (hasDemoGroups) {
        setGroups([]);
      }
    }
  }, [setGroups, groups]);

  const handleFileSelect = async (file: File) => {
    setStatus('uploading');
    setError('');

    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setStatus('parsing');
      const bill = await parsePDF(file);

      setParsedBill(bill);
      setStatus('success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse PDF';
      setError(errorMessage);
      setStatus('error');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setParsedBill(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 max-w-6xl mx-auto py-12 px-4 w-full">
        <header className="mb-12 text-center">
          <div className="flex justify-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">SplitBill</h1>
              <p className="text-gray-600 mt-2 text-lg">
                Upload your AT&T bill to automatically split charges
              </p>
              {isDemoMode && (
                <div className="mt-3 inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                  🎭 Demo Mode - Try it out with sample data!
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="space-y-8">
          {status === 'success' && parsedBill ? (
            <>
              {/* Action buttons */}
              <div className="flex justify-center gap-4">
                <Button onClick={handleReset} variant="outline">
                  Upload Another Bill
                </Button>
              </div>

              {/* View toggle buttons */}
              <div className="flex justify-center gap-2">
                <Button
                  onClick={() => setViewMode('table')}
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  className="min-w-[120px]"
                >
                  All Lines
                </Button>
                <Button
                  onClick={() => setViewMode('groups')}
                  variant={viewMode === 'groups' ? 'default' : 'outline'}
                  className="min-w-[120px]"
                >
                  Groups
                </Button>
              </div>

              {/* Conditional view rendering */}
              {viewMode === 'table' ? (
                <ResultsTable bill={parsedBill} />
              ) : (
                <GroupsView bill={parsedBill} />
              )}
            </>
          ) : (
            <UploadZone
              onFileSelect={handleFileSelect}
              status={status}
              error={error}
            />
          )}
        </main>
      </div>

      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Left: Copyright */}
            <div className="text-sm text-gray-600">
              © {new Date().getFullYear()} SplitBill. All rights reserved.
            </div>

            {/* Center: Info */}
            <div className="text-sm text-gray-500">
              Supports AT&T bills • T-Mobile & Verizon coming soon
            </div>

            {/* Right: Made with */}
            <div className="text-sm text-gray-600">
              Made with ♥ for easy bill splitting
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Feedback Button */}
      <button
        onClick={() => window.open('https://github.com/venwork-dev/split-bill/issues/new?labels=feedback&template=feedback.md', '_blank')}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 font-medium z-50"
      >
        <span>💬</span>
        <span>Feedback</span>
      </button>
    </div>
  );
}

export default App;
