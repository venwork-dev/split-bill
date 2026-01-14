import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ChevronDown, ChevronRight, Edit2, Trash2, Users, TrendingUp, DollarSign } from 'lucide-react';
import { useGroupStore } from '@/stores/groupStore';

interface GroupsViewProps {
  bill: ParsedBill;
}

export function GroupsView({ bill }: GroupsViewProps) {
  const groups = useGroupStore((state) => state.groups);
  const updateGroup = useGroupStore((state) => state.updateGroup);
  const deleteGroup = useGroupStore((state) => state.deleteGroup);
  const getGroupedLineNumbers = useGroupStore((state) => state.getGroupedLineNumbers);
  const removeLinesFromGroup = useGroupStore((state) => state.removeLinesFromGroup);

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(groups.map(g => g.id))
  );
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);

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

  const startEditing = (groupId: string, currentName: string) => {
    setEditingGroupId(groupId);
    setEditingName(currentName);
  };

  const saveEdit = () => {
    if (editingGroupId && editingName.trim()) {
      updateGroup(editingGroupId, { name: editingName.trim() });
      setEditingGroupId(null);
      setEditingName('');
    }
  };

  const cancelEdit = () => {
    setEditingGroupId(null);
    setEditingName('');
  };

  const handleDelete = (groupId: string) => {
    deleteGroup(groupId);
    setShowDeleteDialog(null);
  };

  const handleRemoveLine = (groupId: string, lineNumber: string) => {
    removeLinesFromGroup(groupId, [lineNumber]);
  };

  // Calculate group totals and organize lines
  const groupsData = groups.map(group => {
    const lines = bill.lines.filter(line =>
      group.lineNumbers.includes(line.lineNumber)
    );
    const total = lines.reduce((sum, line) => sum + line.total, 0);
    return { ...group, lines, total };
  });

  // Find ungrouped lines
  const groupedLineNumbers = getGroupedLineNumbers();
  const ungroupedLines = bill.lines.filter(
    line => !groupedLineNumbers.has(line.lineNumber)
  );
  const ungroupedTotal = ungroupedLines.reduce((sum, line) => sum + line.total, 0);

  // Calculate statistics
  const totalGroups = groups.length;
  const largestGroup = groupsData.reduce((max, g) =>
    g.lines.length > (max?.lines.length || 0) ? g : max
  , groupsData[0]);
  const mostExpensiveGroup = groupsData.reduce((max, g) =>
    g.total > (max?.total || 0) ? g : max
  , groupsData[0]);

  if (groups.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <Card className="border-gray-200">
          <CardContent className="py-16 text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Groups Yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Create groups to organize your phone lines and track expenses by family, department, or any category you choose.
            </p>
            <p className="text-sm text-gray-500">
              Switch to "All Lines" view and select lines to create your first group.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalGroups}</div>
                <div className="text-sm text-gray-600">Total Groups</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {largestGroup && (
          <Card className="border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xl font-bold text-gray-900 truncate">
                    {largestGroup.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    Largest Group • {largestGroup.lines.length} lines
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {mostExpensiveGroup && (
          <Card className="border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xl font-bold text-gray-900 truncate">
                    {mostExpensiveGroup.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    Most Expensive • {formatCurrency(mostExpensiveGroup.total)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Groups List */}
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
                <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={() => toggleGroup(group.id)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        {expandedGroups.has(group.id) ? (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-500" />
                        )}
                      </button>

                      {editingGroupId === group.id ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit();
                              if (e.key === 'Escape') cancelEdit();
                            }}
                            className="max-w-xs"
                            autoFocus
                          />
                          <Button size="sm" onClick={saveEdit}>
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: group.color }}
                          />
                          <span className="text-lg font-semibold text-gray-900">
                            {group.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({group.lines.length} {group.lines.length === 1 ? 'line' : 'lines'})
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-xl font-bold text-gray-900 tabular-nums">
                        {formatCurrency(group.total)}
                      </div>
                      {editingGroupId !== group.id && (
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditing(group.id, group.name)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowDeleteDialog(group.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Group Lines (expandable) */}
                {expandedGroups.has(group.id) && (
                  <div className="bg-gray-50">
                    {group.lines.map((line, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-6 py-3 pl-14 border-t border-gray-100 group/line"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">
                            {line.lineName}
                          </div>
                          <div className="font-mono text-sm text-gray-500">
                            {line.lineNumber}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-semibold text-gray-900 tabular-nums">
                            {formatCurrency(line.total)}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="opacity-0 group-hover/line:opacity-100 transition-opacity"
                            onClick={() => handleRemoveLine(group.id, line.lineNumber)}
                          >
                            <Trash2 className="w-3 h-3 text-gray-400" />
                          </Button>
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
                        <div>
                          <div className="font-semibold text-gray-700">
                            {line.lineName}
                          </div>
                          <div className="font-mono text-sm text-gray-500">
                            {line.lineNumber}
                          </div>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog !== null} onOpenChange={() => setShowDeleteDialog(null)}>
        <DialogContent>
          <DialogClose onClose={() => setShowDeleteDialog(null)} />
          <DialogHeader>
            <DialogTitle>Delete Group</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this group? The lines will become ungrouped but won't be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => showDeleteDialog && handleDelete(showDeleteDialog)}
            >
              Delete Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
