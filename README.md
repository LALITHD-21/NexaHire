# ⚡ TalentSync AI

> **"From resumes to real potential — redefining hiring with AI precision and fairness."**

An advanced AI-powered recruiting intelligence platform that revolutionizes hiring by moving beyond keyword-based filtering. Uses deep semantic understanding, behavioral insights, and predictive intelligence — powered by OpenAI GPT.

![License](https://img.shields.io/badge/license-MIT-green)
![Size](https://img.shields.io/badge/repo%20size-%3C10MB-blue)
![Python](https://img.shields.io/badge/python-3.10+-yellow)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-teal)

---

## 🎯 Problem Statement

The recruiting industry ($2T+) relies on outdated keyword matching, causing:
- ❌ Skilled candidates overlooked
- ❌ Bias in job descriptions and hiring
- ❌ Inefficient manual screening
- ❌ Poor candidate-job fit

## 💡 Solution

TalentSync AI automates and enhances the recruiting pipeline with 6 AI modules:

| Module | Description |
|--------|-------------|
| 📄 **Resume Analyzer** | Deep skills, project complexity & growth trajectory analysis |
| 🎯 **Smart Matching** | Semantic candidate-job matching beyond keywords |
| 🧠 **AI Interviewer** | Adaptive interview simulator with real-time scoring |
| ⚖️ **Bias Detector** | Scans job descriptions for gender, age & exclusionary bias |
| 🚀 **Career Coach** | Gap analysis with personalized learning roadmaps |
| ✉️ **Outreach Generator** | Human-like, personalized recruiter messages |

## 🏗️ Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Frontend UI    │────▶│  FastAPI Backend  │────▶│   OpenAI GPT     │
│  HTML+CSS+JS     │◀────│  (Single File)    │◀────│   API            │
│  (~200KB)        │     │  app.py           │     │   gpt-4o-mini    │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5 + CSS3 + Vanilla JS |
| Backend | Python FastAPI (single file) |
| AI | OpenAI GPT-4o-mini |
| Deployment | Docker + Google Cloud Run |

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

### Setup

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/TalentSync-AI.git
cd TalentSync-AI

# Create virtual environment
python -m venv venv
venv\Scripts\activate    # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Configure API key
copy .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Run the server
cd backend
python app.py
```

Open http://localhost:8000 in your browser.

### Docker

```bash
docker compose up --build
```

### Cloud Run

```bash
gcloud run deploy talentsync-ai \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars OPENAI_API_KEY=your_key
```

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/analyze-resume` | POST | Upload & analyze resume |
| `/api/match` | POST | Candidate-job matching |
| `/api/interview` | POST | AI interview Q&A |
| `/api/detect-bias` | POST | Bias detection |
| `/api/career-coach` | POST | Career gap analysis |
| `/api/generate-outreach` | POST | Recruiter outreach |

## 📦 Output Format

```json
{
  "match_score": 87,
  "confidence": 0.92,
  "key_strengths": ["AI", "Backend", "Cloud"],
  "skill_gaps": ["System Design"],
  "recommendations": ["Build scalable projects"],
  "explanation": "Candidate shows strong real-world AI project experience..."
}
```

## 🔐 Security

- ✅ API keys in `.env` (never exposed)
- ✅ Input validation on all endpoints
- ✅ CORS configured
- ✅ No keys in frontend code

## 🌟 What Makes This Winning

- ⚡ Real-time processing (<2s responses)
- 🧠 Explainable AI (every decision explained)
- ⚖️ Active bias reduction
- 🎨 Stunning glassmorphism UI
- 📦 Ultra-light repo (<10MB)
- 🐳 Docker + Cloud Run ready

## 📁 Project Structure

```
TalentSync-AI/
├── index.html          # Frontend UI
├── style.css           # Design system
├── script.js           # Frontend logic
├── backend/
│   └── app.py          # FastAPI server
├── requirements.txt    # Python deps
├── Dockerfile          # Container config
├── docker-compose.yml  # Local dev
├── .env.example        # Config template
├── .gitignore
└── README.md
```

## 🔮 Future Scope

- LinkedIn profile analyzer
- Voice-based AI interviewer
- Real-time recruiter dashboard
- Candidate ranking leaderboard
- Multi-language support
- Firebase Firestore persistence

## 📄 License

MIT License — free to use, modify, and distribute.

---

**Built with ❤️ for the future of fair, intelligent hiring.**
