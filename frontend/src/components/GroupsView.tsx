import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ParsedBill } from '@/types/bill.types';
import { GROUPS } from '@/config/groups';
import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface GroupsViewProps {
  bill: ParsedBill;
}

export function GroupsView({ bill }: GroupsViewProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(GROUPS.map(g => g.id)) // All expanded by default
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  // Calculate group totals and organize lines
  const groupsData = GROUPS.map(group => {
    const lines = bill.lines.filter(line =>
      group.lineNumbers.includes(line.lineNumber)
    );
    const total = lines.reduce((sum, line) => sum + line.total, 0);
    return { ...group, lines, total };
  });

  // Find ungrouped lines
  const groupedLineNumbers = new Set(GROUPS.flatMap(g => g.lineNumbers));
  const ungroupedLines = bill.lines.filter(
    line => !groupedLineNumbers.has(line.lineNumber)
  );
  const ungroupedTotal = ungroupedLines.reduce((sum, line) => sum + line.total, 0);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="border-gray-200">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="text-2xl font-semibold">Groups</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {/* Render each group */}
            {groupsData.map(group => (
              <div key={group.id}>
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {expandedGroups.has(group.id) ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                    <span className="text-lg font-semibold text-gray-900">
                      {group.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({group.lines.length} {group.lines.length === 1 ? 'line' : 'lines'})
                    </span>
                  </div>
                  <div className="text-xl font-bold text-gray-900 tabular-nums">
                    {formatCurrency(group.total)}
                  </div>
                </button>

                {/* Group Lines (expandable) */}
                {expandedGroups.has(group.id) && (
                  <div className="bg-gray-50">
                    {group.lines.map((line, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-6 py-3 pl-14 border-t border-gray-100"
                      >
                        <div className="font-mono text-sm text-gray-700">
                          {line.lineNumber}
                        </div>
                        <div className="text-sm font-semibold text-gray-900 tabular-nums">
                          {formatCurrency(line.total)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Ungrouped Lines */}
            {ungroupedLines.length > 0 && (
              <div>
                <button
                  onClick={() => toggleGroup('ungrouped')}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {expandedGroups.has('ungrouped') ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                    <span className="text-lg font-semibold text-gray-500">
                      Ungrouped
                    </span>
                    <span className="text-sm text-gray-500">
                      ({ungroupedLines.length} {ungroupedLines.length === 1 ? 'line' : 'lines'})
                    </span>
                  </div>
                  <div className="text-xl font-bold text-gray-700 tabular-nums">
                    {formatCurrency(ungroupedTotal)}
                  </div>
                </button>

                {expandedGroups.has('ungrouped') && (
                  <div className="bg-gray-50">
                    {ungroupedLines.map((line, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-6 py-3 pl-14 border-t border-gray-100"
                      >
                        <div className="font-mono text-sm text-gray-700">
                          {line.lineNumber}
                        </div>
                        <div className="text-sm font-semibold text-gray-900 tabular-nums">
                          {formatCurrency(line.total)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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
