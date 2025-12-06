# OpenInterviewer

Open-source AI-powered qualitative research interview platform. Conduct deep, nuanced interviews at scale with AI interviewers that adapt their style based on participant responses.

## Features

- **AI-Powered Interviews**: Configurable AI interviewer with structured, standard, or exploratory modes
- **Profile Extraction**: Automatically gather participant demographic information during natural conversation
- **Multi-Question Support**: Define core research questions that the AI weaves into conversation naturally
- **Real-time Analysis**: Automatic synthesis of stated vs revealed preferences, themes, and contradictions
- **Secure Deployment**: API keys stay server-side, never exposed to participants
- **One-Click Deploy**: Deploy your own instance to Vercel in minutes

## Deploy Your Own Instance

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/linxule/openinterviewer&env=GEMINI_API_KEY,ADMIN_PASSWORD&envDescription=API%20key%20for%20Gemini%20and%20admin%20password%20for%20researcher%20access&envLink=https://aistudio.google.com/apikey&project-name=openinterviewer&repository-name=openinterviewer&stores=%5B%7B%22type%22:%22kv%22%7D%5D)

### Quick Start

1. Click the "Deploy with Vercel" button above
2. Connect your GitHub account (if not already)
3. Enter the required environment variables:
   - `GEMINI_API_KEY`: Your Google Gemini API key ([Get one here](https://aistudio.google.com/apikey))
   - `ADMIN_PASSWORD`: Password to access the researcher dashboard
4. Click "Deploy"
5. Wait for deployment to complete (~2 minutes)
6. Visit your app and configure your study!

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Gemini API key for AI interviews |
| `ADMIN_PASSWORD` | Yes | Password to protect researcher dashboard |
| `ANTHROPIC_API_KEY` | No | Optional: Use Claude instead of Gemini for interviews |
| `AI_PROVIDER` | No | `gemini` (default) or `claude` |
| `AI_MODEL` | No | Override default model (e.g., `claude-sonnet-4-20250514`) |

## How It Works

### For Researchers

1. **Setup Study** (`/setup`): Configure your research questions, profile fields, and AI interview style
2. **Generate Link**: Create a shareable participant link with your study configuration embedded
3. **Share**: Distribute the link to participants via email, survey tools, or social media
4. **View Results** (`/dashboard`): Access transcripts, analysis, and export data

### For Participants

1. **Click Link**: Participants visit the shared URL
2. **Consent**: Read study information and consent to participate
3. **Interview**: Chat naturally with the AI interviewer
4. **Complete**: View summary and thank you message

### Data Flow

```
Participant → Consent → Interview → Analysis → Export
                 ↓
           AI Interviewer (Gemini/Claude)
                 ↓
           Vercel KV (Storage)
                 ↓
        Researcher Dashboard
```

## Local Development

```bash
# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev

# Build for production
npm run build
```

### Development without Vercel KV

The app works without Vercel KV during development:
- Interview data is not persisted (warning shown)
- Dashboard shows empty state
- All other features work normally

To test with KV locally, install the [Vercel CLI](https://vercel.com/docs/cli) and run:

```bash
vercel link
vercel env pull .env.local
```

## Project Structure

```
/src
├── app/                      # Next.js App Router pages
│   ├── api/                  # API routes (server-side)
│   │   ├── interview/        # AI interview generation
│   │   ├── greeting/         # Interview greeting
│   │   ├── synthesis/        # Interview analysis
│   │   ├── generate-link/    # Participant URL generation
│   │   ├── interviews/       # CRUD for stored interviews
│   │   └── auth/            # Authentication
│   ├── setup/               # Study configuration
│   ├── consent/             # Participant consent
│   ├── interview/           # Interview chat
│   ├── synthesis/           # Analysis view
│   ├── export/              # Data export
│   ├── dashboard/           # Researcher dashboard
│   ├── login/               # Researcher login
│   └── p/[token]/           # Participant entry point
├── components/              # React components
├── lib/                     # Server-side utilities
│   ├── ai.ts               # AI provider abstraction
│   ├── providers/          # Gemini & Claude implementations
│   └── kv.ts               # Vercel KV client
├── services/               # Client-side services
├── store.ts                # Zustand state management
├── types.ts                # TypeScript types
└── middleware.ts           # Auth protection
```

## AI Provider Configuration

### Default: Gemini
The app uses Gemini by default for all AI operations:
- Interview responses
- Greeting generation
- Interview synthesis

### Optional: Claude for Interviews
To use Claude for interviews while keeping Gemini for speech:

```env
AI_PROVIDER=claude
ANTHROPIC_API_KEY=your-claude-api-key
```

Note: Speech-to-text and text-to-speech (future feature) will always use Gemini for cost efficiency.

## Security

- **API Keys**: Stored as server-side environment variables, never exposed to browser
- **Participant URLs**: Signed JWT tokens that cannot be tampered with
- **Dashboard**: Password-protected with HTTP-only cookie authentication
- **Data**: Stored in Vercel KV (Redis) with encrypted connections

## License

MIT

## Contributing

Contributions welcome! Please read the contributing guidelines before submitting PRs.
