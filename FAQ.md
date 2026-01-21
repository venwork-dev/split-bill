# Frequently Asked Questions

## General Questions

### What carriers are supported?
Currently only **AT&T** bills are supported. T-Mobile and Verizon support are planned for future releases.

### Is my data stored anywhere?
No. All processing happens locally on your machine. PDFs are temporarily stored in the `backend/temp` folder during parsing and then deleted. Groups are saved only in your browser's localStorage.

### How much does it cost to run?
- **LlamaParse**: Free tier (1000 pages/day) - plenty for personal use
- **Total estimated cost**: ~$0.02-0.04/month for typical usage (1-2 bills)

### Can I use this for commercial purposes?
Yes, the project is MIT licensed. However, please verify the API usage terms with LlamaCloud and OpenAI for commercial use.

## Setup & Installation

### Do I need to use Bun?
No, but it's recommended. You can use Node.js 22+ instead:
```bash
npm install  # instead of bun install
npm run dev  # instead of bun run dev
```

### I don't have API keys. Can I still use it?
No, you need a [LlamaCloud API key](https://cloud.llamaindex.ai) to parse PDFs. The free tier is generous for personal use.

### The backend won't start. What's wrong?
Common issues:
- Port 3001 already in use (change PORT in .env)
- Missing .env file (copy from .env.example)
- Invalid API keys (verify at cloud.llamaindex.ai)
- Missing temp directory (run `mkdir temp` in backend folder)

## Usage Questions

### Can I upload multiple bills at once?
Not yet. Currently, you can upload one bill at a time. Multi-bill support is planned.

### How do I edit a line's amount after parsing?
Currently not supported. The parser extracts data as-is from the bill. Manual editing is a planned feature.

### Can I export my groups?
Not yet. CSV/PDF export is on the roadmap.

### My bill parsed incorrectly. What should I do?
1. Verify it's an AT&T bill (other carriers not yet supported)
2. Check if the PDF is a scanned image (text-based PDFs work best)
3. Open an issue on GitHub with details about the parsing error

### Where are groups stored?
Groups are stored in your browser's localStorage with key `splitbill-groups`. They persist across page refreshes but are lost if you clear browser data.

## Features & Roadmap

### When will T-Mobile/Verizon support be added?
We're actively working on it! Follow the repo for updates.

### Can I track bills over time?
Not yet. Historical tracking is planned for a future release.

### Can I share my groups with others?
Not yet. Shareable links are on the roadmap.

### Can I customize group colors?
Not yet in the UI, but groups do have color assignments. Custom color selection is a planned enhancement.

## Technical Questions

### Why does parsing take 5-10 seconds?
The backend uses LlamaParse to extract text from PDF, then OpenAI to structure the data. This involves:
1. Uploading PDF to LlamaParse (~2-3s)
2. PDF text extraction (~2-3s)
3. AI structuring with GPT-4o-mini (~2-3s)

### Can I self-host this?
Yes! The entire stack runs locally. For production deployment:
- Deploy backend to any Node.js host (Railway, Render, Fly.io)
- Deploy frontend to Vercel, Netlify, or Cloudflare Pages
- Update API_URL in frontend code to point to your backend

### Is there a Docker setup?
Not yet, but it's on the roadmap. Contributions welcome!

### Why Bun instead of Node?
Bun is faster, has built-in TypeScript support, and includes package management. But Node.js 22+ works fine too if you prefer it.

## Privacy & Security

### Should I be concerned about uploading my bill?
The app processes files locally and doesn't store them permanently. However:
- Redact sensitive info (SSN, full account numbers) before uploading
- Run the app on your own machine, not a shared computer
- Don't commit .env files with API keys to version control

### Does this violate AT&T's terms of service?
This tool is for personal use to help understand and split your own bills. It doesn't violate any terms. Always verify amounts against your actual bill.

---

**Still have questions?** Open an issue on GitHub or start a discussion!
