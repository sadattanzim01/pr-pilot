# <img width="40" height="40" alt="logo" src="https://github.com/user-attachments/assets/b6b455dc-fc89-40bb-8cb7-79d7f9e795e7"> PR Pilot: AI-Powered Pull Request Reviewer

> PR Pilot is a full-stack AI agent that automatically reviews GitHub pull requests the moment they are opened. It fetches the code diff, sends it to Claude for analysis, posts a structured review comment directly on the PR, and logs everything to a live dashboard.

**Live Demo:** [pr-pilot-woad.vercel.app](https://pr-pilot-woad.vercel.app)

---

<img width="1512" height="342" alt="Screenshot 2026-08-09 at 6 54 13 PM" src="https://github.com/user-attachments/assets/b0a5e3bc-8760-4daa-83f5-72b116257701">

---

## What It Does

When a developer opens a pull request on a connected repository, PR Pilot:

1. Receives a webhook event from GitHub
2. Verifies the request is genuinely from GitHub using HMAC signature
3. Fetches the full diff and changed file contents via the GitHub API
4. Sends the code context to Claude (Anthropic's AI) with a structured review prompt
5. Claude generates a detailed review covering summary, strengths, bugs, suggestions, and security concerns
6. The review is posted as a comment directly on the GitHub PR
7. The review is saved to a PostgreSQL database
8. The dashboard updates with the new review in real time

---

<img width="672" height="646" alt="Screenshot 2026-08-09 at 6 53 35 PM" src="https://github.com/user-attachments/assets/83a76718-23ca-47dd-8546-bb755a0b513e"><img width="672" height="646" alt="Screenshot 2026-08-09 at 6 53 50 PM" src="https://github.com/user-attachments/assets/75b4959d-260b-4146-8990-b98b1677e37d">

---

## Architecture

```
Developer opens a PR on GitHub
            ↓
GitHub fires a POST webhook to Railway backend
            ↓
Express server verifies HMAC signature (security)
            ↓
Octokit fetches PR diff + changed file contents
            ↓
Claude (claude-sonnet-4-6) generates structured review
            ↓
Review is posted as a comment on the GitHub PR
            ↓
Review is saved to Supabase PostgreSQL database
            ↓
React dashboard displays review history live
```

---

## Tech Stack

### Languages
| Language | Where Used |
|---|---|
| **JavaScript** | Express backend, all server-side logic |
| **TypeScript** | React frontend, type-safe component code |
| **SQL** | Supabase database schema and queries |
| **CSS (Tailwind)** | All frontend styling via utility classes |

### Frontend
| Tool | Purpose |
|---|---|
| **React** | Component-based UI framework |
| **TypeScript** | Type safety across all components |
| **Tailwind CSS** | Utility-first styling, dark theme |
| **Axios** | HTTP requests from frontend to backend |
| **React Router** | Client-side page navigation |

### Backend
| Tool | Purpose |
|---|---|
| **Node.js** | JavaScript runtime for the server |
| **Express.js** | Web framework — handles routes and middleware |
| **Octokit** | GitHub's official API library — fetches diffs, posts comments |
| **@anthropic-ai/sdk** | Official Claude API SDK — generates code reviews |
| **node-crypto** | HMAC signature verification for webhook security |
| **dotenv** | Loads environment variables from `.env` file |
| **cors** | Allows the React frontend to talk to the Express backend |
| **nodemon** | Auto-restarts the server during development |
| **axios** | HTTP requests from backend to GitHub OAuth endpoint |

### Database
| Tool | Purpose |
|---|---|
| **PostgreSQL** | Relational database — stores all PR reviews |
| **Supabase** | Hosted PostgreSQL with built-in dashboard and connection pooling |
| **pg (node-postgres)** | Node.js driver for connecting to PostgreSQL |

### AI
| Tool | Purpose |
|---|---|
| **Anthropic Claude** | Generates structured code reviews from diffs and file context |
| **claude-sonnet-4-6** | The specific Claude model used for reviews |

### Infrastructure & Deployment
| Platform | Purpose |
|---|---|
| **Vercel** | Hosts the React frontend — auto-deploys on every push to `main` |
| **Railway** | Hosts the Node.js backend — auto-deploys on every push to `main` |
| **Supabase** | Hosts the PostgreSQL database in US East (North Virginia) |
| **GitHub OAuth** | Handles user authentication — "Login with GitHub" |
| **GitHub Webhooks** | Sends PR events to the Railway backend in real time |
| **ngrok** | Tunnels localhost to a public URL during local development |

---

<img width="438" height="262" alt="Screenshot 2026-08-09 at 7 18 10 PM" src="https://github.com/user-attachments/assets/bf8cc86f-5e01-4ff7-adb2-20f508617b00">
<img width="1080" height="158" alt="Screenshot 2026-08-09 at 6 54 58 PM" src="https://github.com/user-attachments/assets/92dd4432-2bbe-405f-bf19-98e2b856d050">

---

<img width="547" height="195" alt="Screenshot 2026-08-09 at 6 55 54 PM" src="https://github.com/user-attachments/assets/1e3e47d9-998f-4100-ba2a-c58831c8dde6">

---

<img width="1208" height="442" alt="Screenshot 2026-08-09 at 6 54 38 PM" src="https://github.com/user-attachments/assets/5071def9-4dcc-4190-bc03-9b4ca516f6da">

---

## How Each Part Works

### GitHub OAuth
The user clicks "Connect GitHub" which redirects them to GitHub's authorization page. After approving, GitHub sends a one-time code back to the Express server at `/auth/github/callback`. The server exchanges that code for a permanent access token and redirects the user back to the React dashboard with the token in the URL. React saves it to `localStorage` so the user stays logged in.

### Webhook Listener
When a repository owner adds the PR Pilot webhook to their repo, GitHub sends a `POST` request to `/webhook/github` every time a pull request is opened, updated, or reopened. The server first verifies the request came from GitHub by checking the HMAC-SHA256 signature using the shared webhook secret. If the signature matches, it extracts the PR metadata and fires the review agent in the background.

### Claude Review Agent
The agent calls three GitHub API endpoints in sequence: it fetches the raw diff (the `+/-` line changes), the list of changed files, and the full content of each file for additional context. It combines this into a single structured prompt and sends it to Claude. Claude returns a formatted review with six sections: Summary, Strengths, Issues Found, Suggestions, Security Concerns, and Overall Assessment. The review is posted as a comment on the PR and saved to the database.

### Dashboard
The React frontend makes two API calls when the user is logged in: one to `/api/user` to fetch their GitHub profile (name and avatar), and one to `/api/reviews` to fetch all reviews from the database. The dashboard shows review stats and a clickable list of every PR review. Clicking any review opens a formatted detail view of Claude's full analysis.

---

## How the Pieces Connect

```
Vercel (React frontend)
    │
    │  User clicks "Connect GitHub"
    ↓
Railway (Express backend) ──── GitHub OAuth ────► GitHub
    │                                              │
    │  Webhook fires when PR is opened             │
    │◄─────────────────────────────────────────────┘
    │
    │  Fetch diff + files
    │──────────────────────────────────────────────► GitHub API
    │
    │  Send diff to Claude
    │──────────────────────────────────────────────► Anthropic API
    │
    │  Post review comment
    │──────────────────────────────────────────────► GitHub PR
    │
    │  Save review to database
    │──────────────────────────────────────────────► Supabase
    │
    │  Dashboard fetches reviews
    │◄────────────────────────────────────────────── Supabase
    │
Vercel (React dashboard displays results)
```

---

## How to Use PR Pilot

1. Go to [pr-pilot-woad.vercel.app](https://pr-pilot-woad.vercel.app)
2. Click **"Connect GitHub"** and authorize the app
3. In any GitHub repository you own, go to **Settings → Webhooks → Add webhook**
4. Set the Payload URL to `https://pr-pilot-production.up.railway.app/webhook/github`
5. Set Content type to `application/json`, Secret to `prpilot_secret_123`, and select **Pull requests** events
6. Open a pull request on that repository
7. Within 20 seconds, Claude will post a structured review comment on the PR
8. Return to the dashboard to see the review in your history

---

<!-- INSERT: Screenshot of Claude's full review showing all sections including Issues Found and Overall Assessment -->

---

## Local Development

### Prerequisites
- Node.js 20+
- A Supabase account (free tier)
- An Anthropic API key
- A GitHub OAuth App
- ngrok (for local webhook testing)

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

```
PORT=3001
ANTHROPIC_API_KEY=your_anthropic_key
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GITHUB_WEBHOOK_SECRET=your_webhook_secret
GITHUB_TOKEN=your_github_personal_access_token
DB_PASSWORD=your_supabase_db_password
DATABASE_URL=your_supabase_transaction_pooler_url
```

### Run Locally

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm start

# Terminal 3 — Webhook tunnel
ngrok http 3001
```

Use the ngrok URL as your webhook Payload URL in GitHub repo settings.

---

## Database Schema

```sql
-- Stores all PR reviews
CREATE TABLE pull_requests (
  id SERIAL PRIMARY KEY,
  repo_full_name VARCHAR(255) NOT NULL,
  pr_number INTEGER NOT NULL,
  title TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  review TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(repo_full_name, pr_number)
);
```

---

## Why This Project

Code reviews are one of the most time-consuming parts of software development. PR Pilot demonstrates how AI agents can integrate directly into developer workflows — no extra tools, no context switching. The review appears right where the developer is already working: on the pull request itself.

This project showcases a complete production-grade architecture: OAuth authentication, event-driven webhook processing, AI API integration, persistent storage, and a live dashboard — all deployed and running on real infrastructure.

---

## Author

**Sadat Tanzim**
[GitHub](https://github.com/sadattanzim01) · [LinkedIn](https://linkedin.com/in/sadattanzim)
