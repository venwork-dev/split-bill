import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
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

          <p className="text-xs text-gray-400">PDF files only, up to 10MB</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
