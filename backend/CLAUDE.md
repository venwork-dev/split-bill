# Backend - Agent Guide

## Overview
Express API server that parses AT&T PDF bills using LlamaParse and OpenAI to extract structured data.

## Tech Stack
- **Runtime**: Node.js 22+ or Bun
- **Framework**: Express
- **PDF Parsing**: LlamaParse (by LlamaIndex)
- **AI Processing**: OpenAI GPT-4o-mini
- **File Upload**: Multer
- **CORS**: Enabled for frontend communication

## Commands (Use Bun!)
```bash
bun install    # Install dependencies
bun run dev    # Start with hot reload (port 3001)
bun run start  # Start production server
```

## Environment Variables (.env)
```env
LLAMA_CLOUD_API_KEY=your_llamacloud_api_key
OPENAI_API_KEY=your_openai_api_key
PORT=3001
```

Get API keys:
- LlamaCloud: https://cloud.llamaindex.ai
- OpenAI: https://platform.openai.com/api-keys

## Key Files
- `server.js` - Express server with `/api/extract` endpoint
- `llamaparse_agent.js` - LlamaParse + OpenAI processing logic
- `temp/` - Temporary file storage (auto-created)

## API Endpoints

### POST /api/extract
Upload PDF and extract bill data.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (PDF file)

**Response:**
```json
{
  "total_amount": 674.12,
  "line_count": 11,
  "lines": [
    {
      "phone_number": "214.957.3190",
      "line_name": "KODUMURI VAMSHI",
      "amount_owed": 53.14
    }
  ]
}
```

**Error Response:**
```json
{
  "error": "Error message here"
}
```

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-14T..."
}
```

## Architecture

### Processing Flow
```
1. Frontend uploads PDF via multipart/form-data
    ↓
2. Multer saves file to temp/
    ↓
3. LlamaParse extracts text from PDF
    ↓
4. OpenAI structures data (phone numbers, names, amounts)
    ↓
5. Response sent to frontend
    ↓
6. Temp file deleted
```

### LlamaParse Configuration
```javascript
{
  resultType: "markdown",
  numWorkers: 4,
  verbose: true,
  language: "en"
}
```

### OpenAI Processing
- Model: `gpt-4o-mini`
- Task: Structure extracted text into JSON
- Output: Line numbers, holder names, amounts

## Development Notes

### File Upload
- Multer saves files to `temp/` directory
- Files auto-deleted after processing
- Max file size: 10MB (configurable in `server.js`)

### Error Handling
- API errors return 500 with error message
- Missing API keys caught on startup
- Invalid PDF format handled gracefully

### CORS
- Enabled for all origins in development
- Configure for production deployment

## Cost Estimates
For typical usage (1-2 bills/month):
- **LlamaParse**: Free (1,000 pages/day limit)
- **OpenAI GPT-4o-mini**: ~$0.01-0.02/bill
- **Total**: ~$0.02-0.04/month

## Troubleshooting

**"LLAMA_CLOUD_API_KEY not found"**
- Create `.env` file (not `.env.example`)
- Add valid API key from https://cloud.llamaindex.ai

**"OpenAI API key not found"**
- Add `OPENAI_API_KEY` to `.env`
- Get key from https://platform.openai.com/api-keys

**"No such file or directory: temp/"**
- Run `mkdir temp` in backend directory
- Server auto-creates if missing (but may need manual creation first time)

**"Only PDF files are allowed"**
- Ensure uploaded file has `.pdf` extension
- Check file MIME type is `application/pdf`

**Port already in use**
- Change `PORT` in `.env`
- Kill existing process on port 3001

## Testing

### Manual Testing
```bash
curl -X POST http://localhost:3001/api/extract \
  -F "file=@/path/to/bill.pdf"
```

### Test Scripts
Located in `../test-scripts/`:
```bash
cd test-scripts
bun install
cp .env.example .env
# Add LLAMA_CLOUD_API_KEY
bun test
# Review llamaparse_output.txt
```

## Deployment Notes

### Environment
- Set production `NODE_ENV=production`
- Configure proper CORS origins
- Use process manager (PM2, systemd)
- Set up file cleanup cron jobs

### Requirements
- Node.js 22+ or Bun runtime
- Write access to `temp/` directory
- Valid API keys
- 512MB+ RAM recommended

## API Response Schema

### LineItem
```typescript
{
  phone_number: string;  // e.g., "214.957.3190"
  line_name: string;     // e.g., "KODUMURI VAMSHI"
  amount_owed: number;   // e.g., 53.14
}
```

### BillResponse
```typescript
{
  total_amount: number;
  line_count: number;
  lines: LineItem[];
}
```

## Future Enhancements
- Support for T-Mobile bills
- Support for Verizon bills
- Caching for repeat uploads
- Webhook notifications
- Batch processing
- Historical data storage

## See Also
- `../README.md` - Project overview
- `README.md` - Backend-specific docs
- `../test-scripts/` - Parser testing
