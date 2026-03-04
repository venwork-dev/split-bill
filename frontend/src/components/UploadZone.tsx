import { useCallback, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Shield } from 'lucide-react';
import type { UploadStatus } from '@/types/bill.types';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  status: UploadStatus;
  error?: string;
}

export function UploadZone({ onFileSelect, status, error }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      const pdfFile = files.find((file) => file.type === 'application/pdf');

      if (pdfFile) {
        onFileSelect(pdfFile);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type === 'application/pdf') {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const isLoading = status === 'uploading' || status === 'parsing';
  const [showColdStartHint, setShowColdStartHint] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShowColdStartHint(false);
      return;
    }
    const timer = setTimeout(() => setShowColdStartHint(true), 4000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-12 text-center transition-colors
          ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
          disabled={isLoading}
        />

        <div className="space-y-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-900">
              {isLoading
                ? status === 'uploading'
                  ? 'Uploading...'
                  : 'Parsing bill...'
                : 'Drop your AT&T bill here'}
            </p>
            <p className="text-sm text-gray-500">or click to browse</p>
          </div>

          <label htmlFor="file-upload">
            <Button variant="outline" className="cursor-pointer" disabled={isLoading} asChild>
              <span>Select PDF File</span>
            </Button>
          </label>

          <p className="text-xs text-gray-500">PDF files only, up to 10MB</p>

          {showColdStartHint && (
            <p className="text-xs text-amber-600 animate-pulse">
              Taking a moment… the server may be waking up from idle.
            </p>
          )}
        </div>
      </div>

      {/* Privacy notice + How to use link */}
      {!isLoading && (
        <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
          <Shield className="w-3 h-3 flex-shrink-0" />
          <span>Your PDF is processed on our server and immediately deleted. We never store your bill data. —</span>
          <button
            onClick={() => setShowHowTo(true)}
            className="underline underline-offset-2 hover:text-gray-700 transition-colors whitespace-nowrap"
          >
            How to use
          </button>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* How to use modal */}
      <Dialog open={showHowTo} onOpenChange={setShowHowTo}>
        <DialogContent>
          <DialogClose onClose={() => setShowHowTo(false)} />
          <DialogHeader>
            <DialogTitle>How to use SplitBill</DialogTitle>
          </DialogHeader>
          <ol className="space-y-5 mt-2">
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-900 text-white text-sm font-semibold flex items-center justify-center">
                1
              </span>
              <div>
                <p className="text-sm font-medium text-gray-900">Download your AT&amp;T bill PDF</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Log in to att.com → <strong>My Bill</strong> → <strong>Download PDF</strong>. Make sure it's the full wireless bill, not a payment receipt.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-900 text-white text-sm font-semibold flex items-center justify-center">
                2
              </span>
              <div>
                <p className="text-sm font-medium text-gray-900">Drop it here</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Each line on the bill appears with the account holder's name and their share of the charges.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-900 text-white text-sm font-semibold flex items-center justify-center">
                3
              </span>
              <div>
                <p className="text-sm font-medium text-gray-900">Organize into groups (optional)</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  Use the <strong>Groups</strong> tab to bundle lines together. Groups are saved in your browser and automatically match up next month as long as the phone numbers haven't changed.
                </p>
              </div>
            </li>
          </ol>
        </DialogContent>
      </Dialog>
    </div>
  );
}
