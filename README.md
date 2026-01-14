# 💰 SplitBill

> Automatically parse and split AT&T phone bills with intelligent line grouping

[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.3-000000?logo=bun&logoColor=white)](https://bun.sh/)
[![Node.js](https://img.shields.io/badge/Node.js-22+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-5.0-000000)](https://zustand-demo.pmnd.rs/)

A modern web application that parses AT&T phone bills (PDF) and splits charges by line with intelligent grouping capabilities. Perfect for families, roommates, or businesses sharing phone plans.

## ✨ Features

- 📄 **Smart PDF Parsing** - Upload AT&T bills and extract line items automatically
- 👥 **Intelligent Grouping** - Organize phone lines into custom groups (Family, Work, etc.)
- 💵 **Automatic Calculations** - See totals per line and per group
- 🎨 **Beautiful UI** - Modern, responsive interface with color-coded groups
- 💾 **Persistent Storage** - Groups saved locally, survives page refreshes
- 📊 **Statistics Dashboard** - View insights like largest group, most expensive group
- ⚡ **Fast** - Built with Bun and Vite for lightning-fast performance

## 🚀 Coming Soon

- 📱 **T-Mobile Support** - Parse T-Mobile bills
- 📱 **Verizon Support** - Parse Verizon bills
- 📤 **Export Options** - Download group summaries as CSV/PDF
- 🔗 **Shareable Links** - Generate links to share group totals
- 📈 **Historical Tracking** - Compare expenses across multiple bills

## 🏗️ Architecture

```
split-bill/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── stores/       # Zustand state management
│   │   ├── utils/        # PDF parsing utilities
│   │   └── types/        # TypeScript definitions
│   └── README.md
│
├── backend/           # Node.js + Express + LlamaParse
│   ├── server.js (llamaparse_agent)
│   └── README.md
```

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19.2 with TypeScript
- **Build Tool:** Vite 7.3
- **Styling:** TailwindCSS 4.1
- **State Management:** Zustand 5.0
- **UI Components:** Radix UI + shadcn/ui
- **Icons:** Lucide React
- **Runtime:** Bun (recommended) or Node.js

### Backend
- **Runtime:** Node.js 22+ or Bun
- **Framework:** Express
- **PDF Parser:** LlamaParse (by LlamaIndex)
- **AI Processing:** OpenAI GPT-4o-mini
- **File Upload:** Multer

## 📦 Installation

### Prerequisites
- Bun 1.3+ (recommended) or Node.js 22+
- API Keys:
  - [LlamaCloud API Key](https://cloud.llamaindex.ai)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd split-bill
   ```

2. **Set up Backend**
   ```bash
   cd backend
   bun install
   cp .env.example .env
   # Edit .env and add your API keys
   mkdir temp
   bun run dev
   ```
   Backend runs on `http://localhost:3001`

3. **Set up Frontend** (in a new terminal)
   ```bash
   cd frontend
   bun install
   bun run dev
   ```
   Frontend runs on `http://localhost:5173`

4. **Open in browser**
   Navigate to `http://localhost:5173`

## 📖 Usage

### 1. Upload Your Bill
- Click "Upload Another Bill" or drag & drop your AT&T PDF bill
- Wait for automatic parsing (usually 5-10 seconds)

### 2. View All Lines
- See all phone lines with holder names and amounts
- Lines displayed with phone numbers and individual charges

### 3. Create Groups
- Select lines using checkboxes
- Click "Create Group" button
- Name your group (e.g., "Family Plan", "Work Lines")
- View group in the "Groups" tab

### 4. Manage Groups
- Switch to "Groups" tab
- View statistics: Total Groups, Largest Group, Most Expensive
- **Edit**: Click ✏️ to rename groups
- **Delete**: Click 🗑️ to remove groups
- **Remove Lines**: Hover over line and click trash icon

## 🔑 Environment Variables

### Backend (.env)
```env
LLAMA_CLOUD_API_KEY=your_llamacloud_key
OPENAI_API_KEY=your_openai_key
PORT=3001
```

### Frontend
No environment variables required (API URL is hardcoded to localhost)

## 💰 Cost Estimate

For typical usage (1-2 bills per month):
- **LlamaParse:** Free (1,000 pages/day limit)
- **Total:** ~$0.02-0.04/month

## 📊 API Response Format

```json
{
  "total_amount": 674.12,
  "line_count": 11,
  "lines": [
    {
      "phone_number": "111.222.3333",
      "line_name": "John Doe",
      "amount_owed": 53.14
    }
  ]
}
```

## 🧪 Development

### Frontend Development
```bash
cd frontend
bun run dev        # Start dev server
bun run build      # Production build
bun run preview    # Preview production build
bun run type-check # TypeScript validation
```

### Backend Development
```bash
cd backend
bun run dev        # Start with hot reload
bun run start      # Start production server
```

### Testing Parser Quality
```bash
cd test-scripts
bun install
cp .env.example .env
# Add your LLAMA_CLOUD_API_KEY
bun test
# Review llamaparse_output.txt
```

## 📚 Documentation

- [Frontend README](./frontend/README.md) - Frontend architecture and components
- [Backend README](./backend/README.md) - API endpoints and parsing logic
- [Grouping Feature](./GROUPING_FEATURE.md) - Technical details of grouping feature
- [Usage Guide](./USAGE_GUIDE.md) - Detailed user guide with examples

## 🤝 Contributing

Contributions welcome! Please feel free to submit issues or pull requests.

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- [LlamaIndex](https://www.llamaindex.ai/) for LlamaParse
- [OpenAI](https://openai.com/) for GPT-4o-mini
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components

## ⚠️ Disclaimer

This tool is designed for personal use to split shared phone bills. Always verify parsed amounts against your actual bill. Not affiliated with AT&T, T-Mobile, or Verizon.

---

**Made with ❤️ for easy bill splitting**
