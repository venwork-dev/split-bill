import { useState } from 'react';
import { UploadZone } from '@/components/UploadZone';
import { ResultsTable } from '@/components/ResultsTable';
import { parseBillPDF } from '@/utils/parsePDF';
import type { ParsedBill, UploadStatus } from '@/types/bill.types';
import { Button } from '@/components/ui/button';

function App() {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [parsedBill, setParsedBill] = useState<ParsedBill | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileSelect = async (file: File) => {
    setStatus('uploading');
    setError('');

    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setStatus('parsing');
      const bill = await parseBillPDF(file);

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-12 px-4">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900">SplitBill</h1>
          <p className="text-gray-600 mt-2 text-lg">
            Upload your AT&T bill to automatically split charges
          </p>
        </header>

        <main className="space-y-8">
          {status === 'success' && parsedBill ? (
            <>
              <div className="flex justify-center">
                <Button onClick={handleReset} variant="outline">
                  Upload Another Bill
                </Button>
              </div>
              <ResultsTable bill={parsedBill} />
            </>
          ) : (
            <UploadZone
              onFileSelect={handleFileSelect}
              status={status}
              error={error}
            />
          )}
        </main>

        <footer className="mt-16 text-center text-sm text-gray-500">
          <p>Phase 1: Core Functionality</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
