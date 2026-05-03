# NexaHire AI

![NexaHire AI](assets/nexahire-mark.svg)

> Talent Intelligence OS for faster, clearer, and fairer recruiting decisions.

NexaHire AI is a polished recruiting command center that brings resume intelligence, semantic job matching, AI interviewing, bias review, career coaching, Google Workspace handoffs, live role signals, and recruiter outreach into one focused workflow.

It is designed as a practical AI product, not a static demo: users can upload resumes, generate explainable scoring, inspect candidate fit through graphs and KPIs, save a recruiter profile, open company career links, and move candidate insights into matching and outreach flows.

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](#tech-stack)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](#tech-stack)
[![OpenAI](https://img.shields.io/badge/OpenAI-ChatGPT-111111?style=for-the-badge&logo=openai&logoColor=white)](#ai-backend)
[![Vanilla JS](https://img.shields.io/badge/Frontend-HTML_CSS_JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=111111)](#tech-stack)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](#docker)

---

## Product Vision

Recruiting teams often lose time and quality because their tools are scattered:

- Resumes are reviewed manually or with shallow keyword filters.
- Job matching is difficult to explain to stakeholders.
- Interview feedback is inconsistent across candidates.
- Job descriptions can contain biased or exclusionary language.
- Candidate outreach takes time and often lacks personalization.
- Recruiter workflows jump between Gmail, Calendar, Meet, Drive, Sheets, and job boards.

NexaHire AI turns that fragmented workflow into a single command center.

The goal is simple: help recruiters and candidates make better hiring decisions with evidence, fairness, and speed.

---

## Highlights

- Premium launch intro inspired by modern product reveal screens.
- Light and dark theme toggle with persistent preference.
- Recruiter profile setup with photo upload, profile saving, sidebar sync, and clean hide-after-save behavior.
- Resume analyzer with AI score, radar graph, KPI cards, score breakdown bars, graph insights, recruiter notes, strengths, weaknesses, summary, and recommendations.
- Semantic candidate-job matching that explains fit, gaps, confidence, and hiring suggestion.
- Adaptive AI interviewer with scoring, feedback, final assessment, metrics, weaknesses, and improvement plan.
- Bias detector for job descriptions with issue highlights and inclusive rewrite.
- Career coach with readiness score, learning roadmap, courses, projects, and motivation.
- Outreach generator for email, LinkedIn/InMail, and follow-up copy.
- Live requirements panel with official company career links.
- Google services panel for Gmail, Calendar, Meet, Drive, Sheets, and Google Careers.
- FastAPI backend with OpenAI ChatGPT integration.
- Docker-ready deployment setup.

---

## Screens And Core Experience

### Command Center

The home page acts as the operating system for recruiting work:

- Hero summary for explainable recruiting intelligence.
- Live fit model preview.
- Metric cards for match accuracy, response time, AI modules, and bias tolerance.
- Recruiter profile setup and saved profile state.
- Smart workflow steps from analysis to outreach.
- Workspace memory for recent AI actions.
- Live role cards with company logos and career links.
- Google Workspace action cards.

### Resume Intelligence

Upload a resume and NexaHire returns a detailed analysis:

- Candidate score.
- Experience level.
- Career trajectory.
- Technical skills, soft skills, and tools.
- Domain expertise.
- Resume radar graph.
- Executive signal KPIs.
- Score breakdown bars:
  - Skills depth
  - Project impact
  - Experience fit
  - Education
  - Communication
  - Growth signal
- Strengths and weaknesses.
- Summary and recommendations.
- Recruiter notes for screening.

### Smart Matching

Paste a resume and job description to receive:

- Match score.
- Confidence value.
- Overall fit.
- Skills match.
- Experience alignment.
- Culture fit.
- Growth potential.
- Skill-by-skill breakdown.
- Key strengths.
- Skill gaps.
- Hiring suggestion.
- Detailed explanation.

### AI Interviewer

Run a structured candidate interview:

- Role-specific questions.
- Difficulty selection.
- Adaptive follow-up behavior.
- Feedback per answer.
- Final score.
- Metrics for technical ability, communication, and problem solving.
- Weaknesses and improvement plan.

### Bias Review

Analyze job descriptions for language that may reduce fairness:

- Bias score.
- Bias level.
- Specific issue list.
- Highlighted original text.
- Inclusive rewritten description.
- Summary for recruiters.

### Career Coach

Create a role-readiness roadmap:

- Readiness score.
- Skill gap analysis.
- Learning phases.
- Recommended courses.
- Project ideas.
- Timeline.
- Motivation.

### Smart Outreach

Generate recruiter-ready messaging:

- Subject line.
- Email message.
- LinkedIn version.
- Follow-up message.
- Personalization score.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| UI Style | Responsive command-center layout, light/dark themes, cinematic loader |
| Backend | Python, FastAPI |
| AI Provider | OpenAI Chat Completions |
| Default Model | `gpt-4.1-mini` |
| File Parsing | PyPDF2, python-docx |
| Runtime | Uvicorn |
| Deployment | Docker, Docker Compose, Cloud Run compatible |

---

## AI Backend

The backend uses the OpenAI Chat Completions API through a small direct HTTP client in `backend/app.py`.

Default model:

```env
MODEL=gpt-4.1-mini
```

The model can be changed from `.env` without changing frontend code.

Never place API keys in frontend files. NexaHire reads secrets from `.env`, which is ignored by git.

---

## Project Structure

```text
NexaHire-AI/
├── assets/
│   ├── bg.png
│   ├── logo.png
│   └── nexahire-mark.svg
├── backend/
│   └── app.py
├── index.html
├── style.css
├── script.js
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## Quick Start

### 1. Requirements

- Python 3.10 or newer
- OpenAI API key
- Modern browser

### 2. Install dependencies

```bash
python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
pip install -r requirements.txt
```

macOS or Linux:

```bash
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Configure environment

```bash
copy .env.example .env
```

On macOS or Linux:

```bash
cp .env.example .env
```

Edit `.env`:

```env
OPENAI_API_KEY=your_openai_api_key_here
MODEL=gpt-4.1-mini
MAX_TOKENS=2400
CACHE_TTL=3600
```

### 4. Run locally

```bash
python backend/app.py
```

Open:

```text
http://127.0.0.1:8000/
```

---

## Docker

Run with Docker Compose:

```bash
docker compose up --build
```

Then open:

```text
http://127.0.0.1:8000/
```

---

## API Reference

### Health

```http
GET /health
```

Returns provider, model, API-key configuration status, and file parsing support.

### Analyze Resume

```http
POST /api/analyze-resume
Content-Type: multipart/form-data
```

Input:

- `file`: PDF, DOCX, TXT, or DOC resume file.

Returns:

- Candidate score
- Score breakdown
- Skills
- Strengths
- Weaknesses
- Projects
- Career trajectory
- Domain expertise
- Education quality
- Summary
- Recommendations
- Graph insights
- Recruiter notes

### Match Candidate To Job

```http
POST /api/match
Content-Type: application/json
```

```json
{
  "resume_text": "Candidate resume text",
  "job_description": "Target job description"
}
```

### AI Interview

```http
POST /api/interview
Content-Type: application/json
```

```json
{
  "message": "Candidate answer or command",
  "role": "Software Engineer",
  "history": [],
  "difficulty": "medium"
}
```

### Detect Bias

```http
POST /api/detect-bias
Content-Type: application/json
```

```json
{
  "job_description": "Job description text"
}
```

### Career Coach

```http
POST /api/career-coach
Content-Type: application/json
```

```json
{
  "current_skills": "Python, React, SQL",
  "target_role": "Senior AI Engineer",
  "experience_level": "mid"
}
```

### Generate Outreach

```http
POST /api/generate-outreach
Content-Type: application/json
```

```json
{
  "candidate_name": "Alex Chen",
  "candidate_skills": "Python, AWS, FastAPI",
  "target_role": "Senior AI Engineer",
  "company_name": "NexaHire AI",
  "tone": "professional"
}
```

---

## Example Resume Analysis Output

```json
{
  "candidate_score": 85,
  "experience_level": "senior",
  "score_breakdown": {
    "skills_depth": 80,
    "project_impact": 85,
    "experience_alignment": 90,
    "education_strength": 60,
    "communication_signal": 70,
    "growth_signal": 80
  },
  "skills": {
    "technical": ["Python", "TypeScript", "FastAPI", "AWS"],
    "soft": ["leadership", "mentoring"],
    "tools": ["AWS", "FastAPI"]
  },
  "career_trajectory": "growing",
  "summary": "Candidate shows strong AI engineering depth with measurable delivery impact.",
  "graph_insights": [
    "Project impact and experience alignment are the strongest signals."
  ],
  "recruiter_notes": [
    "Validate system design depth during interview."
  ]
}
```

---

## Environment Variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `OPENAI_API_KEY` | Yes | None | OpenAI API key used by the backend |
| `MODEL` | No | `gpt-4.1-mini` | Chat model used for AI modules |
| `MAX_TOKENS` | No | `2000` | Maximum model output tokens |
| `CACHE_TTL` | No | `3600` | In-memory response cache duration in seconds |

---

## Security Notes

- `.env` is gitignored.
- API keys are used only by the backend.
- No API key is shipped to the browser.
- Resume files are parsed in memory for analysis.
- The current cache is in-memory and resets when the server restarts.
- Use HTTPS and stricter CORS rules before deploying publicly.

---

## Design System

NexaHire uses a modern command-center interface:

- Space Grotesk for display headlines.
- Manrope for interface text.
- Light and dark themes.
- Google-inspired accent colors.
- Glass panels with restrained borders.
- Responsive grids for desktop and mobile.
- Cinematic launch intro.
- Accessible status labels and button states.

---

## Deployment Notes

For a production deployment:

1. Set `OPENAI_API_KEY` as a server-side secret.
2. Set `MODEL` to the preferred model.
3. Serve behind HTTPS.
4. Restrict CORS to trusted domains.
5. Add persistent storage if user profiles or activity history need to sync across devices.
6. Add authentication before exposing candidate data to teams.

Example Cloud Run style command:

```bash
gcloud run deploy nexahire-ai \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars MODEL=gpt-4.1-mini
```

Set the API key through your cloud secret manager rather than writing it into deployment commands.

---

## Troubleshooting

### The app opens but AI calls fail

Check that `.env` contains:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

Then restart the server.

### The health endpoint says the key is not configured

Open:

```text
http://127.0.0.1:8000/health
```

If `api_key_configured` is `false`, the server did not load the key. Confirm the `.env` file is in the project root.

### Resume upload works but graph looks empty

The graph depends on the AI response fields. Re-run the analysis with a resume that contains skills, projects, experience, and education details.

### API quota or billing errors

Check your OpenAI usage limits and billing status in the OpenAI dashboard.

---

## Roadmap

- Candidate ranking board.
- Saved candidate database.
- Team authentication.
- Google Drive resume import.
- Gmail draft creation through OAuth.
- Calendar interview scheduling through OAuth.
- Interview transcript export.
- Multi-language resume analysis.
- Role requirement monitor.
- PDF report export.

---

## License

MIT License.

---

## Tagline

NexaHire AI turns hiring data into explainable action: analyze better, match smarter, interview clearer, write fairer, and reach candidates faster.
