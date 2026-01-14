import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import type { ParsedBill } from '@/types/bill.types';
import { useState } from 'react';
import { Plus, Users } from 'lucide-react';
import { useGroupStore } from '@/stores/groupStore';

interface ResultsTableProps {
  bill: ParsedBill;
}

export function ResultsTable({ bill }: ResultsTableProps) {
  const [selectedLines, setSelectedLines] = useState<Set<string>>(new Set());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [groupName, setGroupName] = useState('');
  const createGroup = useGroupStore((state) => state.createGroup);
  const getGroupForLine = useGroupStore((state) => state.getGroupForLine);

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

  const handleCreateGroup = () => {
    if (groupName.trim() && selectedLines.size > 0) {
      createGroup(groupName.trim(), Array.from(selectedLines));
      setGroupName('');
      setSelectedLines(new Set());
      setShowCreateDialog(false);
    }
  };

  const handleSelectAll = () => {
    setSelectedLines(new Set(bill.lines.map(line => line.lineNumber)));
  };

  const handleClearSelection = () => {
    setSelectedLines(new Set());
  };

  const selectedTotal = bill.lines
    .filter(line => selectedLines.has(line.lineNumber))
    .reduce((sum, line) => sum + line.total, 0);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Selection Controls */}
      {bill.lines.length > 0 && (
        <div className="mb-4 flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {selectedLines.size > 0 ? (
                <>
                  <span className="text-gray-900">{selectedLines.size}</span> line{selectedLines.size !== 1 ? 's' : ''} selected
                </>
              ) : (
                'Select lines to create a group'
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {selectedLines.size > 0 ? (
              <>
                <Button
                  onClick={handleClearSelection}
                  variant="outline"
                  size="sm"
                >
                  Clear
                </Button>
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Group
                </Button>
              </>
            ) : (
              <Button
                onClick={handleSelectAll}
                variant="outline"
                size="sm"
              >
                Select All
              </Button>
            )}
          </div>
        </div>
      )}

      <Card className="border-gray-200">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="text-2xl font-semibold">Bill Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Line Items List */}
          <div className="divide-y divide-gray-100">
            {bill.lines.map((line, index) => {
              const group = getGroupForLine(line.lineNumber);
              return (
                <div
                  key={index}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Checkbox for grouping functionality */}
                  <Checkbox
                    checked={selectedLines.has(line.lineNumber)}
                    onCheckedChange={() => toggleLineSelection(line.lineNumber)}
                    className="border-gray-300"
                  />

                  {/* Line Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-gray-900">
                        {line.lineName}
                      </div>
                      {group && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: group.color }}
                        >
                          {group.name}
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-sm text-gray-500 mt-0.5">
                      {line.lineNumber}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="text-lg font-semibold text-gray-900 tabular-nums">
                    {formatCurrency(line.total)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Total (if any lines selected) */}
          {selectedLines.size > 0 && (
            <div className="border-t-2 border-blue-200 bg-blue-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-blue-900">
                  Selected Total ({selectedLines.size} {selectedLines.size === 1 ? 'line' : 'lines'})
                </div>
                <div className="text-xl font-bold text-blue-900 tabular-nums">
                  {formatCurrency(selectedTotal)}
                </div>
              </div>
            </div>
          )}

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

      {/* Create Group Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogClose onClose={() => setShowCreateDialog(false)} />
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
            <DialogDescription>
              Create a group for the {selectedLines.size} selected line{selectedLines.size !== 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label htmlFor="group-name" className="block text-sm font-medium text-gray-700 mb-2">
                Group Name
              </label>
              <Input
                id="group-name"
                placeholder="e.g., Family Plan, Work Lines"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateGroup();
                  }
                }}
                autoFocus
              />
            </div>

            {/* Preview of selected lines */}
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">
                Lines in this group:
              </div>
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                {bill.lines
                  .filter(line => selectedLines.has(line.lineNumber))
                  .map((line, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-2 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {line.lineName}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        {line.lineNumber} • {formatCurrency(line.total)}
                      </div>
                    </div>
                  ))}
              </div>
              <div className="mt-2 text-sm font-semibold text-gray-700">
                Group Total: {formatCurrency(selectedTotal)}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateGroup}
              disabled={!groupName.trim()}
            >
              Create Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
