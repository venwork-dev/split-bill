/**
 * Phone Bill Parser Backend API
 * Extracts phone line details from AT&T PDF bills using LlamaExtract
 */

import express, { Request, Response } from "express";
import multer from "multer";
import cors from "cors";
import * as dotenv from "dotenv";
import { promises as fs } from "fs";
import { LlamaExtract } from "llama-cloud-services";

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

// Middleware
app.use(cors());
app.use(express.json());

// Types
interface PhoneLine {
  number: string;
  user: string;
  total: number;
}

interface ExtractionResult {
  service_activity_lines: PhoneLine[];
}

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
 * Extract phone bill data using LlamaExtract agent
 */
async function extractPhoneBill(filePath: string): Promise<BillData> {
  // Initialize LlamaExtract client (reads LLAMA_CLOUD_API_KEY from env)
  const extractor = new LlamaExtract();

  // Get the extraction agent by name
  const agent = await extractor.getAgent("att bill extract");
  if (!agent) {
    throw new Error("Extraction agent 'att bill extract' not found");
  }

  // Run extraction
  const result = await agent.extract(filePath);

  // Type guard to safely extract the data
  const data = result?.data as unknown;
  if (!data || typeof data !== 'object' || !('service_activity_lines' in data)) {
    throw new Error("No service activity lines found in extraction result");
  }

  const extractedData = data as ExtractionResult;

  // Transform to desired format
  const billData: BillData = {
    total_amount: extractedData.service_activity_lines.reduce((sum, line) => sum + line.total, 0),
    line_count: extractedData.service_activity_lines.length,
    lines: extractedData.service_activity_lines.map(line => ({
      phone_number: line.number,
      line_name: line.user,
      amount_owed: line.total
    }))
  };

  return billData;
}

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

// Extract endpoint
app.post("/api/extract", upload.single("file"), async (req: Request, res: Response) => {
  let uploadedFilePath: string | undefined;

  try {
    // Validate API key
    if (!process.env.LLAMA_CLOUD_API_KEY) {
      return res.status(500).json({
        error: "Server configuration error: LLAMA_CLOUD_API_KEY not set"
      });
    }

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
