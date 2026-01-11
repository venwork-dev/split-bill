import * as pdfjsLib from 'pdfjs-dist';
import type { ParsedBill, LineItem } from '@/types/bill.types';

// Set worker path for PDF.js - using local worker file from package
// Vite will handle bundling this as a separate chunk
const workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href;
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

/**
 * Represents a text item with position information from PDF
 */
interface PDFTextItem {
  str: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Extract text content with positioning from a PDF file
 */
async function extractTextWithPositions(file: File): Promise<PDFTextItem[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const allItems: PDFTextItem[] = [];

  // Extract text from all pages with positioning
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    for (const item of textContent.items) {
      const textItem = item as any;
      if (textItem.str && textItem.transform) {
        allItems.push({
          str: textItem.str,
          x: textItem.transform[4],
          y: textItem.transform[5],
          width: textItem.width,
          height: textItem.height,
        });
      }
    }
  }

  return allItems;
}

/**
 * Convert positioned text items to plain text (for backward compatibility)
 */
function positionedTextToPlainText(items: PDFTextItem[]): string {
  // Group by Y coordinate (same line)
  const lineMap = new Map<number, PDFTextItem[]>();

  for (const item of items) {
    const yRounded = Math.round(item.y);
    if (!lineMap.has(yRounded)) {
      lineMap.set(yRounded, []);
    }
    lineMap.get(yRounded)!.push(item);
  }

  // Sort lines by Y (top to bottom) and items within lines by X (left to right)
  const sortedLines = Array.from(lineMap.entries())
    .sort((a, b) => b[0] - a[0]); // PDF Y coordinates go bottom to top

  let text = '';
  for (const [, items] of sortedLines) {
    items.sort((a, b) => a.x - b.x);
    text += items.map(item => item.str).join(' ') + '\n';
  }

  return text;
}

/**
 * Parse AT&T bill using positioned text items (more reliable than regex)
 * Finds the Monthly charges table and extracts phone numbers with their totals
 */
function parseATTBillWithPositions(items: PDFTextItem[]): ParsedBill {
  const lines: LineItem[] = [];

  console.log('=== PARSING WITH POSITION DATA ===');
  console.log(`Total text items: ${items.length}`);

  // Group items by Y coordinate (same row, within 2 pixels)
  const rowMap = new Map<number, PDFTextItem[]>();

  for (const item of items) {
    const yRounded = Math.round(item.y / 2) * 2; // Group within 2px
    if (!rowMap.has(yRounded)) {
      rowMap.set(yRounded, []);
    }
    rowMap.get(yRounded)!.push(item);
  }

  // Sort rows by Y (top to bottom)
  const rows = Array.from(rowMap.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([y, items]) => {
      items.sort((a, b) => a.x - b.x); // Sort items left to right
      return { y, items, text: items.map(i => i.str).join(' ') };
    });

  console.log(`Grouped into ${rows.length} rows`);

  // Find rows with phone numbers in the monthly charges section
  let inMonthlyCharges = false;

  for (const row of rows) {
    const text = row.text;

    // Start when we see "Monthly charges"
    if (text.includes('Monthly charges')) {
      console.log('Found Monthly charges section');
      inMonthlyCharges = true;
      continue;
    }

    // Stop at subtotal or end markers
    if (text.includes('Subtotal for Group') ||
        text.includes('Total for Wireless') ||
        text.includes('Detailed usage')) {
      console.log(`Stopping at: ${text.substring(0, 50)}`);
      inMonthlyCharges = false;
    }

    if (!inMonthlyCharges) continue;

    // Look for phone numbers in this row
    const phonePattern = /\d{3}\.\d{3}\.\d{4}/;
    const phoneMatch = text.match(phonePattern);

    if (phoneMatch) {
      const phoneNumber = phoneMatch[0];

      // Find all prices in this row
      const prices = row.items
        .filter(item => item.str.startsWith('$'))
        .map(item => ({
          price: item.str,
          x: item.x,
          value: parseFloat(item.str.replace(/[$,]/g, ''))
        }))
        .filter(p => !isNaN(p.value));

      if (prices.length > 0) {
        console.log(`  Found ${prices.length} prices:`, prices.map(p => `${p.price}(x=${p.x.toFixed(1)})`).join(', '));

        // Strategy: The Total column is the LARGEST reasonable price in the row
        // (since Total = Plan + Equipment + Add-ons + Fees + Taxes)
        // Filter to reasonable line totals ($1 to $500)
        const reasonablePrices = prices.filter(p => Math.abs(p.value) >= 1 && Math.abs(p.value) <= 500);

        if (reasonablePrices.length === 0) {
          console.log(`  ✗ No reasonable prices found (all < $1 or > $500)`);
          continue;
        }

        // Take the LARGEST reasonable price (this is the Total)
        const largestPrice = reasonablePrices.reduce((max, p) => Math.abs(p.value) > Math.abs(max.value) ? p : max);
        let totalAmount = largestPrice.value;

        // Check for negative sign before the price
        const priceIndex = row.items.findIndex(item => item === row.items.find(i => i.str === largestPrice.price));
        if (priceIndex > 0 && row.items[priceIndex - 1].str === '-') {
          totalAmount = -totalAmount;
          console.log(`  Detected negative sign before ${largestPrice.price}`);
        }

        // Check for duplicates
        const isDuplicate = lines.some(l => l.lineNumber === phoneNumber);

        if (!isDuplicate) {
          lines.push({
            lineNumber: phoneNumber,
            total: totalAmount,
          });
          console.log(`✓ Added: ${phoneNumber} → $${totalAmount.toFixed(2)} (largest of ${reasonablePrices.length} reasonable prices)`);
        } else {
          console.log(`✗ Skipped duplicate: ${phoneNumber}`);
        }
      }
    }
  }

  console.log(`Found ${lines.length} lines using position-based parsing`);

  // Convert to plain text for secondary parsing strategies
  const plainText = positionedTextToPlainText(items);

  // Fallback: Also look for "Total for XXX.XXX.XXXX $XX.XX" pattern
  console.log('\n=== FALLBACK: Looking for "Total for" patterns ===');
  const totalForPattern = /Total for\s+(\d{3}\.\d{3}\.\d{4})\s+\$(\d{1,3}(?:,\d{3})*\.\d{2})/gi;
  const matches = plainText.matchAll(totalForPattern);

  for (const match of matches) {
    const phoneNumber = match[1];
    const totalAmount = parseFloat(match[2].replace(/,/g, ''));

    const isDuplicate = lines.some(l => l.lineNumber === phoneNumber);
    if (!isDuplicate) {
      lines.push({
        lineNumber: phoneNumber,
        total: totalAmount,
      });
      console.log(`✓ Found via "Total for": ${phoneNumber} → $${totalAmount.toFixed(2)}`);
    }
  }

  console.log(`\n=== FINAL LINE ITEMS ===`);
  lines.forEach(line => {
    console.log(`${line.lineNumber}: $${line.total.toFixed(2)}`);
  });

  return buildParsedBill(lines, plainText);
}

/**
 * Build the final ParsedBill object from line items and text
 */
function buildParsedBill(lines: LineItem[], text: string): ParsedBill {
  // Extract total bill amount from "Total due" or "AutoPay"
  let totalAmount = 0;
  const totalPatterns = [
    /Total due\s*\$?([\d,]+\.\d{2})/i,
    /Total Amount Due\s*\$?([\d,]+\.\d{2})/i,
    /AutoPay.*?\$?([\d,]+\.\d{2})/i,
  ];

  for (const pattern of totalPatterns) {
    const match = text.match(pattern);
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ''));
      if (amount > 0 && amount < 10000) {
        totalAmount = amount;
        console.log(`Found total amount: $${totalAmount.toFixed(2)} (pattern: ${pattern.source.substring(0, 20)}...)`);
        break;
      }
    }
  }

  // Fallback: Sum all line totals if no total found
  if (totalAmount === 0) {
    totalAmount = lines.reduce((sum, line) => sum + line.total, 0);
    console.log(`No total found in text, using sum of lines: $${totalAmount.toFixed(2)}`);
  }

  // Extract billing period
  const billingPeriodPattern = /(\w{3}\s+\d{1,2},?\s+\d{4})\s*-\s*(\w{3}\s+\d{1,2},?\s+\d{4})/i;
  const billingPeriodMatch = text.match(billingPeriodPattern);

  console.log(`\n=== PARSING COMPLETE ===`);
  console.log(`Total lines: ${lines.length}`);
  console.log(`Total Amount Due: $${totalAmount.toFixed(2)}`);
  console.log(`Billing Period: ${billingPeriodMatch ? billingPeriodMatch[0] : 'Not found'}`);

  return {
    lines,
    totalAmount,
    billingPeriod: billingPeriodMatch ? billingPeriodMatch[0] : undefined,
  };
}

/**
 * Main function to parse an AT&T bill PDF
 * Uses position-based parsing for more reliable table extraction
 */
export async function parseBillPDF(file: File): Promise<ParsedBill> {
  try {
    if (file.type !== 'application/pdf') {
      throw new Error('Please upload a PDF file');
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }

    console.log('=== STARTING PDF PARSING ===');
    console.log(`File: ${file.name}, Size: ${(file.size / 1024).toFixed(2)} KB`);

    // Extract text with position information
    const items = await extractTextWithPositions(file);

    if (!items || items.length === 0) {
      throw new Error('Could not extract text from PDF. The file may be empty or corrupted.');
    }

    // Use position-based parsing (more reliable)
    const parsedBill = parseATTBillWithPositions(items);

    if (parsedBill.lines.length === 0) {
      throw new Error('No line items found in the bill. Please ensure this is a valid AT&T bill.');
    }

    return parsedBill;
  } catch (error) {
    console.error('PDF parsing error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to parse PDF. Please try again.');
  }
}
