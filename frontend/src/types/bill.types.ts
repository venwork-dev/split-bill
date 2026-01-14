/**
 * Type definitions for AT&T bill parsing and display
 */

/**
 * Represents a single phone line item on the bill
 */
export interface LineItem {
  lineNumber: string; // e.g., "214.957.3190"
  total: number; // Total cost for this line
}

/**
 * Represents the parsed bill data
 */
export interface ParsedBill {
  lines: LineItem[]; // Array of all line items
  totalAmount: number; // Final bill total (Total Amount Due)
  billingPeriod?: string; // e.g., "Dec 15, 2025 - Jan 14, 2026"
}

/**
 * Upload status for the PDF file
 */
export type UploadStatus = 'idle' | 'uploading' | 'parsing' | 'success' | 'error';

/**
 * Error details for parsing failures
 */
export interface ParseError {
  message: string;
  details?: string;
}
