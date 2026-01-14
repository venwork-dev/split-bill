/**
 * Phone Bill Parser - Backend API
 * Express server with LlamaParse + Gemini integration
 * Updated to use new @google/genai SDK with gemini-2.0-flash-lite
 */

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { LlamaParseReader } from 'llamaindex';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs/promises';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  dest: 'temp/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Initialize Gemini AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Phone Bill Parser API is running (Gemini 2.0 Flash Lite)',
    timestamp: new Date().toISOString()
  });
});

// Main parsing endpoint
app.post('/api/parse-phone-bill', upload.single('file'), async (req, res) => {
  let filePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    filePath = req.file.path;
    console.log(`Processing file: ${req.file.originalname}`);

    // Step 1: Parse PDF with LlamaParse
    console.log('Parsing PDF with LlamaParse...');
    const reader = new LlamaParseReader({
      apiKey: process.env.LLAMA_CLOUD_API_KEY,
      resultType: 'markdown',
      verbose: false,
      parsingInstruction: 'Extract all pages including the detailed service activity table with phone numbers, users, and charges.'
    });

    const documents = await reader.loadData(filePath);
    const parsedText = documents.map(doc => doc.text).join('\n\n');
    console.log(`Extracted ${parsedText.length} characters from PDF`);

    // Step 2: Extract structured data with Gemini
    console.log('Extracting structured data with Gemini 2.0 Flash Lite...');

    const prompt = `You are a phone bill parser. Extract ONLY the individual phone line charges from the "Service activity" or "Wireless" section.

Look for the table that shows:
- Phone numbers (e.g., 214.957.3190, 302.310.7589)
- User names (e.g., KODUMURI VAMSHI, NAVEEN KUMAR)
- Total charge per line (rightmost "Total" column)

Extract all phone lines from this bill:

${parsedText}

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "account_holder": "primary account holder name",
  "billing_period": "billing period if found",
  "total_amount": 0.00,
  "lines": [
    {
      "phone_number": "xxx.xxx.xxxx",
      "line_name": "user name",
      "amount_owed": 0.00
    }
  ]
}

IMPORTANT: Extract each individual phone line from the service activity table, not summary totals.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-lite',
      contents: prompt
    });

    // Parse the response
    let responseText = response.text;

    // Remove markdown code blocks if present
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const billData = JSON.parse(responseText);
    console.log(`Extracted ${billData.lines?.length || 0} phone lines`);

    // Cleanup temp file
    await fs.unlink(filePath);

    res.json(billData);

  } catch (error) {
    console.error('Error processing file:', error);

    // Cleanup temp file on error
    if (filePath) {
      try {
        await fs.unlink(filePath);
      } catch (cleanupError) {
        console.error('Error cleaning up temp file:', cleanupError);
      }
    }

    res.status(500).json({
      error: 'Failed to parse phone bill',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Phone Bill Parser API running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📄 Parse endpoint: POST http://localhost:${PORT}/api/parse-phone-bill`);
  console.log(`🤖 Using: Gemini 2.0 Flash Lite (FREE)\n`);
});
