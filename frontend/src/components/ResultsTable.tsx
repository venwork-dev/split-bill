import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import type { ParsedBill } from '@/types/bill.types';
import { useState } from 'react';

interface ResultsTableProps {
  bill: ParsedBill;
}

export function ResultsTable({ bill }: ResultsTableProps) {
  const [selectedLines, setSelectedLines] = useState<Set<string>>(new Set());

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const toggleLineSelection = (lineNumber: string) => {
    const newSelection = new Set(selectedLines);
    if (newSelection.has(lineNumber)) {
      newSelection.delete(lineNumber);
    } else {
      newSelection.add(lineNumber);
    }
    setSelectedLines(newSelection);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="border-gray-200">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="text-2xl font-semibold">Bill Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Line Items List */}
          <div className="divide-y divide-gray-100">
            {bill.lines.map((line, index) => (
              <div
                key={index}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                {/* Checkbox for future merging functionality */}
                <Checkbox
                  checked={selectedLines.has(line.lineNumber)}
                  onCheckedChange={() => toggleLineSelection(line.lineNumber)}
                  className="border-gray-300"
                />

                {/* Line Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 font-mono">
                    {line.lineNumber}
                  </div>
                </div>

                {/* Total */}
                <div className="text-lg font-semibold text-gray-900 tabular-nums">
                  {formatCurrency(line.total)}
                </div>
              </div>
            ))}
          </div>

          {/* Total Amount Due */}
          <div className="border-t-2 border-gray-200 bg-gray-50 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-gray-900">
                Total Amount Due
              </div>
              <div className="text-2xl font-bold text-gray-900 tabular-nums">
                {formatCurrency(bill.totalAmount)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
