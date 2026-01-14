# Phone Bill Parser

A web application to parse phone bills and extract line items with charges using LlamaParse and OpenAI.

## Project Structure

```
phone-bill-parser/
├── test-scripts/       # Verification script to test parsing quality
│   ├── verify-parser.js
│   ├── package.json
│   └── .env.example
├── backend/           # Express API server
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/          # React UI (to be migrated)
└── README.md
```

## Tech Stack

- **Backend:** Node.js + Express + LlamaParse + OpenAI
- **Frontend:** React (existing UI)
- **Runtime:** Node.js or Bun (your choice)

## Getting Started

### Step 1: Verify Parser Quality (CRITICAL FIRST STEP)

Before building the full application, verify that LlamaParse works with your phone bills.

```bash
# 1. Navigate to test scripts
cd test-scripts

# 2. Install dependencies (choose one)
npm install
# or
bun install

# 3. Set up API key
cp .env.example .env
# Edit .env and add your LLAMA_CLOUD_API_KEY from https://cloud.llamaindex.ai

# 4. Copy your phone bill PDF to test-scripts/ folder

# 5. Run verification
npm test
# or
bun test
```

**What to check in the output:**
- ✅ Are phone numbers correctly extracted?
- ✅ Are dollar amounts accurate?
- ✅ Is the text structure preserved?
- ✅ Compare with your current pdf-parse results

Review `llamaparse_output.txt` for full details.

### Step 2: Run Backend API (After verification passes)

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install
# or
bun install

# 3. Set up environment variables
cp .env.example .env
# Add both LLAMA_CLOUD_API_KEY and OPENAI_API_KEY

# 4. Create temp directory
mkdir temp

# 5. Start server
npm run dev
# or
bun run dev
```

API will run on `http://localhost:5000`

**Endpoints:**
- `GET /api/health` - Health check
- `POST /api/parse-phone-bill` - Upload PDF and get parsed data

### Step 3: Integrate with React UI

Your existing React UI just needs to call the backend API:

```javascript
const handleUpload = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('http://localhost:5000/api/parse-phone-bill', {
    method: 'POST',
    body: formData,
  });

  const billData = await response.json();
  // billData contains: { account_holder, billing_period, total_amount, lines: [...] }
};
```

## Cost Estimate (1-2 uses per month)

- **LlamaParse:** Free (1,000 pages/day)
- **OpenAI GPT-4o-mini:** ~$0.01/month
- **Total:** ~$0.01/month

## API Response Format

```json
{
  "account_holder": "John Doe",
  "billing_period": "Jan 1 - Jan 31, 2026",
  "total_amount": 650.22,
  "lines": [
    {
      "phone_number": "913.725.0726",
      "line_name": "Primary Line",
      "amount_owed": 41.07,
      "plan_name": "Unlimited Plus"
    },
    {
      "phone_number": "302.310.7589",
      "line_name": "Line 2",
      "amount_owed": 53.14,
      "plan_name": "Basic Plan"
    }
  ]
}
```

## Development Tips

### Using Bun (Faster Alternative to Node)

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Use bun instead of npm
bun install
bun run dev
bun test
```

### Debugging

- Check `console.log` output in backend terminal
- Inspect `llamaparse_output.txt` for parsing issues
- Use `verbose: true` in LlamaParseReader for detailed logs

## Common Issues

**"LLAMA_CLOUD_API_KEY not found"**
- Make sure `.env` file exists (not `.env.example`)
- Copy the key correctly from https://cloud.llamaindex.ai

**"No such file or directory: temp/"**
- Create temp directory: `mkdir backend/temp`

**"Only PDF files are allowed"**
- Ensure you're uploading a `.pdf` file

## Next Steps

1. ✅ Run verification script with your phone bill
2. ✅ Review parsing quality
3. ✅ Start backend API if verification passes
4. ✅ Integrate with your React UI
5. ✅ Test end-to-end flow

## Questions?

Run the verification script first - that's the most important step to validate this approach will work better than pdf-parse!
