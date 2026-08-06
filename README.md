# <img width="40" height="40" alt="logo" src="https://github.com/user-attachments/assets/b6b455dc-fc89-40bb-8cb7-79d7f9e795e7"> PR Pilot

> AI-powered pull request reviewer that automatically analyzes code changes and posts structured review comments using Claude.


## How It Works

1. Connect your GitHub account via OAuth
2. Add the PR Pilot webhook to any repository
3. Open a pull request — Claude automatically reviews it
4. Structured feedback is posted as a comment on the PR
5. View all reviews in the dashboard

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React + TypeScript + Tailwind CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL + Supabase |
| AI | Anthropic Claude (claude-sonnet-4-6) |
| GitHub | Octokit + OAuth + Webhooks |
| Deploy | Vercel + Railway |

## Features

- 🔐 GitHub OAuth authentication
- 🔗 Webhook integration for automatic PR detection
- 🤖 Claude-powered structured code reviews
- 📋 Summary, Strengths, Issues, Suggestions, Security analysis
- 💾 Review history stored in Supabase
- 📊 Dashboard with review stats and history

## Local Development

### Prerequisites
- Node.js 20+
- PostgreSQL (or Supabase account)
- Anthropic API key
- GitHub OAuth App

### Setup

```bash
# Clone the repo
git clone https://github.com/sadattanzim01/pr-pilot.git
cd pr-pilot

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Environment Variables

Create `server/.env`:
- PORT=3001
- ANTHROPIC_API_KEY=your_key
- GITHUB_CLIENT_ID=your_client_id
- GITHUB_CLIENT_SECRET=your_client_secret
- GITHUB_WEBHOOK_SECRET=your_webhook_secret
- GITHUB_TOKEN=your_github_token
- DATABASE_URL=your_supabase_url

### Run

```bash
# Terminal 1 - Server
cd server && npm run dev

# Terminal 2 - Client
cd client && npm start

# Terminal 3 - Webhook tunnel
ngrok http 3001
```

## Architecture
```bash
GitHub PR Event
↓
Webhook → Express Server
↓
Verify Signature (HMAC)
↓
Fetch Diff + Files (Octokit)
↓
Claude Review Agent
↓
Post Comment to PR + Save to DB
↓
Dashboard displays results
```

## Author

**Sadat Tanzim** — [github.com/sadattanzim01](https://github.com/sadattanzim01)