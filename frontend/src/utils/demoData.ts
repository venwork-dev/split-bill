import type { ParsedBill, Group } from '@/types/bill.types';

export const DEMO_BILL: ParsedBill = {
  totalAmount: 487.56,
  lines: [
    {
      lineNumber: '555-101-2001',
      lineName: 'Alex Johnson',
      total: 65.43
    },
    {
      lineNumber: '555-101-2002',
      lineName: 'Maria Garcia',
      total: 58.21
    },
    {
      lineNumber: '555-101-2003',
      lineName: 'James Smith',
      total: 71.89
    },
    {
      lineNumber: '555-101-2004',
      lineName: 'Sarah Lee',
      total: 45.67
    },
    {
      lineNumber: '555-101-2005',
      lineName: 'Michael Chen',
      total: 82.34
    },
    {
      lineNumber: '555-101-2006',
      lineName: 'Emily Davis',
      total: 53.98
    },
    {
      lineNumber: '555-101-2007',
      lineName: 'David Wilson',
      total: 49.12
    },
    {
      lineNumber: '555-101-2008',
      lineName: 'Jessica Brown',
      total: 60.92
    }
  ]
};

export const DEMO_GROUPS: Group[] = [
  {
    id: 'demo-group-1',
    name: 'Family Plan',
    lineNumbers: ['555-101-2001', '555-101-2002', '555-101-2003'],
    color: '#3b82f6'
  },
  {
    id: 'demo-group-2',
    name: 'Work Lines',
    lineNumbers: ['555-101-2005', '555-101-2007'],
    color: '#10b981'
  },
  {
    id: 'demo-group-3',
    name: 'Roommates',
    lineNumbers: ['555-101-2004', '555-101-2006', '555-101-2008'],
    color: '#8b5cf6'
  }
];
