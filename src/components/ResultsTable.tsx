import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import type { ParsedBill } from '@/types/bill.types';

interface ResultsTableProps {
  bill: ParsedBill;
}

export function ResultsTable({ bill }: ResultsTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Bill Summary</CardTitle>
          {bill.billingPeriod && (
            <CardDescription>Billing Period: {bill.billingPeriod}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Line Number</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bill.lines.map((line, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{line.lineNumber}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(line.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell className="text-right text-lg font-bold">
                  Total Amount Due
                </TableCell>
                <TableCell className="text-right text-lg font-bold">
                  {formatCurrency(bill.totalAmount)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
