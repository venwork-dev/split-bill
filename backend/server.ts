/**
 * Phone Bill Parser Backend API
 * Extracts phone line details from AT&T PDF bills using pdf-parse + regex
 */

import express, { Request, Response } from "express";
import multer from "multer";
import cors from "cors";
import * as dotenv from "dotenv";
import { promises as fs } from "fs";
import { PDFParse } from "pdf-parse";
import path from "path";
import { fileURLToPath } from "url";

// ES module dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configure multer for file uploads - keep original filename
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
      // Keep original filename to preserve .pdf extension
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    }
  })
});

// Middleware - CORS configuration
// Allow all origins for single-service deployment (frontend served from same domain)
app.use(cors());
app.use(express.json());

// Serve static files from frontend build (for single-service deployment)
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

// Types
interface BillData {
  total_amount: number;
  line_count: number;
  lines: {
    phone_number: string;
    line_name: string;
    amount_owed: number;
  }[];
}

/**
 * Extract phone bill data from AT&T PDF using regex parsing.
 *
 * Strategy:
 *   1. Pull full names from section headers — "Phone, XXX.XXX.XXXX\nFULL NAME"
 *      (the page 2 summary table truncates names like "NAVEEN KUMAR ...")
 *   2. Pull totals from the unique "Total for XXX.XXX.XXXX  $XX.XX" lines
 *      (appears exactly once per line, no duplicates possible)
 *   3. Join on phone number
 *   4. Sanity check: sum of line totals must match "Total for Wireless $X"
 */
async function extractPhoneBill(filePath: string): Promise<BillData> {
  const buffer = await fs.readFile(filePath);
  const parser = new PDFParse({ data: buffer });
  const { text } = await parser.getText();

  // Step 1: phone → full name
  // Matches "Phone, 214.957.3190\nKODUMURI VAMSHI" and "Wearable, 945.214.5965\nAPPLE WATCH"
  const nameMap = new Map<string, string>();
  const headerRegex = /(?:Phone|Wearable),\s+(\d{3}\.\d{3}\.\d{4})\s*\n\s*([A-Z][A-Z ]+)/g;
  let match: RegExpExecArray | null;
  while ((match = headerRegex.exec(text)) !== null) {
    nameMap.set(match[1], match[2].trim());
  }

  // Step 2: phone → total
  // Matches "Total for 214.957.3190    $76.58" — appears exactly once per line
  const totalMap = new Map<string, number>();
  const totalRegex = /Total for (\d{3}\.\d{3}\.\d{4})\s+\$([0-9,]+\.\d{2})/g;
  while ((match = totalRegex.exec(text)) !== null) {
    totalMap.set(match[1], parseFloat(match[2].replace(/,/g, '')));
  }

  if (totalMap.size === 0) {
    throw new Error(
      "No line totals found in the PDF. " +
      "Make sure this is an AT&T wireless bill — other bill formats are not supported yet."
    );
  }

  // Step 3: build line items, join name + total on phone number
  const lines = Array.from(totalMap.entries()).map(([phone, amount]) => ({
    phone_number: phone,
    line_name: nameMap.get(phone) ?? "Unknown",
    amount_owed: amount,
  }));

  // Step 4: sanity check — line totals must sum to the wireless section total
  const lineSum = Math.round(lines.reduce((sum, l) => sum + l.amount_owed, 0) * 100) / 100;
  const wirelessMatch = text.match(/Total for Wireless\s+\$([0-9,]+\.\d{2})/);
  if (wirelessMatch) {
    const wirelessTotal = parseFloat(wirelessMatch[1].replace(/,/g, ''));
    if (Math.abs(lineSum - wirelessTotal) > 0.02) {
      throw new Error(
        `Parse validation failed: line totals sum ($${lineSum.toFixed(2)}) ` +
        `does not match wireless total ($${wirelessTotal.toFixed(2)}). ` +
        "The bill may have an unsupported charge type — please verify manually."
      );
    }
  }

  return {
    total_amount: lineSum,
    line_count: lines.length,
    lines,
  };
}

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

// API Routes (must come before catch-all)
app.post("/api/extract", upload.single("file"), async (req: Request, res: Response) => {
  let uploadedFilePath: string | undefined;

  try {
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded. Please upload a PDF file."
      });
    }

    uploadedFilePath = req.file.path;

    console.log(`📄 Processing file: ${req.file.originalname} (${(req.file.size / 1024).toFixed(2)} KB)`);
    console.log(`   File path: ${uploadedFilePath}`);
    console.log(`   MIME type: ${req.file.mimetype}`);

    // Extract phone bill data
    const billData = await extractPhoneBill(uploadedFilePath);

    console.log(`✅ Extraction complete! Found ${billData.line_count} lines, total: $${billData.total_amount.toFixed(2)}`);

    // Clean up uploaded file
    await fs.unlink(uploadedFilePath);

    // Return result
    res.json(billData);

  } catch (error) {
    console.error("❌ Error processing file:", error);

    // Clean up uploaded file if it exists
    if (uploadedFilePath) {
      try {
        await fs.unlink(uploadedFilePath);
      } catch (unlinkError) {
        console.error("Error deleting uploaded file:", unlinkError);
      }
    }

    res.status(500).json({
      error: error instanceof Error ? error.message : "An unknown error occurred"
    });
  }
});

// Catch-all route: serve index.html for client-side routing (MUST be last)
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log("=".repeat(60));
  console.log(`🚀 Phone Bill Parser API`);
  console.log("=".repeat(60));
  console.log(`\n📍 Server running on: http://localhost:${PORT}`);
  console.log(`\n📋 Endpoints:`);
  console.log(`   GET  /health          - Health check`);
  console.log(`   POST /api/extract     - Extract phone bill data (PDF upload)`);
  console.log(`\n✅ Ready to accept requests!\n`);
});

export default app;
