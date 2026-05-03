"""
NexaHire AI - Backend API Server
FastAPI backend with OpenAI ChatGPT integration.
"""

import hashlib
import io
import json
import os
import pathlib
import re
import urllib.error
import urllib.request
import time
from datetime import datetime

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

try:
    import PyPDF2
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False

try:
    import docx
    DOCX_SUPPORT = True
except ImportError:
    DOCX_SUPPORT = False

load_dotenv(dotenv_path=pathlib.Path(__file__).parent / ".env", override=True)
load_dotenv(override=True)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") or os.getenv("CHATGPT_API_KEY", "")
MODEL = os.getenv("MODEL", "gpt-4.1-mini")
MAX_TOKENS = int(os.getenv("MAX_TOKENS", "2000"))
CACHE_TTL = int(os.getenv("CACHE_TTL", "3600"))
OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions"

if not OPENAI_API_KEY:
    print("WARNING: OPENAI_API_KEY not set. API calls will fail.")

_cache = {}


def _get(key):
    if key in _cache and time.time() - _cache[key]["t"] < CACHE_TTL:
        return _cache[key]["d"]
    _cache.pop(key, None)
    return None


def _set(key, data):
    _cache[key] = {"d": data, "t": time.time()}


def _ck(*values):
    return hashlib.md5("|".join(str(x)[:500] for x in values).encode()).hexdigest()


app = FastAPI(title="NexaHire AI", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class MatchRequest(BaseModel):
    resume_text: str
    job_description: str


class InterviewRequest(BaseModel):
    message: str
    role: str = "Software Engineer"
    history: list = []
    difficulty: str = "medium"


class BiasRequest(BaseModel):
    job_description: str


class OutreachRequest(BaseModel):
    candidate_name: str
    candidate_skills: str
    target_role: str
    company_name: str = "Our Company"
    tone: str = "professional"


class CoachRequest(BaseModel):
    current_skills: str
    target_role: str
    experience_level: str = "mid"


async def ask_ai(system: str, user: str, json_mode=True, temperature=0.7):
    if not OPENAI_API_KEY:
        raise HTTPException(status_code=500, detail="OpenAI API key is not configured")

    try:
        payload = {
            "model": MODEL,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            "temperature": temperature,
            "max_tokens": MAX_TOKENS,
        }
        if json_mode:
            payload["response_format"] = {"type": "json_object"}

        request = urllib.request.Request(
            OPENAI_CHAT_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        with urllib.request.urlopen(request, timeout=90) as response:
            data = json.loads(response.read().decode("utf-8"))

        text = (((data.get("choices") or [{}])[0].get("message") or {}).get("content") or "").strip()
        if json_mode:
            try:
                return json.loads(text)
            except json.JSONDecodeError:
                match = re.search(r"\{.*\}", text, re.DOTALL)
                return json.loads(match.group()) if match else {"error": "Parse failed", "raw": text}
        return {"response": text}
    except urllib.error.HTTPError as exc:
        raw = exc.read().decode("utf-8", errors="ignore")
        try:
            message = (json.loads(raw).get("error") or {}).get("message") or raw
        except json.JSONDecodeError:
            message = raw or exc.reason
        raise HTTPException(status_code=exc.code, detail=f"OpenAI Error: {message}")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"OpenAI Error: {str(exc)}")


def parse_file(file: UploadFile) -> str:
    raw = file.file.read()
    name = (file.filename or "").lower()
    if name.endswith(".pdf") and PDF_SUPPORT:
        reader = PyPDF2.PdfReader(io.BytesIO(raw))
        return "\n".join(page.extract_text() or "" for page in reader.pages)
    if name.endswith(".docx") and DOCX_SUPPORT:
        document = docx.Document(io.BytesIO(raw))
        return "\n".join(paragraph.text for paragraph in document.paragraphs)
    return raw.decode("utf-8", errors="ignore")


@app.get("/")
async def root():
    frontend_index = pathlib.Path(__file__).parent.parent / "index.html"
    if frontend_index.exists():
        return FileResponse(str(frontend_index))
    return {
        "status": "running",
        "service": "NexaHire AI",
        "provider": "openai",
        "model": MODEL,
        "version": "1.0.0",
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "provider": "openai",
        "model": MODEL,
        "api_key_configured": bool(OPENAI_API_KEY),
        "ts": datetime.now().isoformat(),
        "pdf": PDF_SUPPORT,
        "docx": DOCX_SUPPORT,
    }


@app.post("/api/analyze-resume")
async def analyze_resume(file: UploadFile = File(...)):
    text = parse_file(file)
    if not text.strip():
        raise HTTPException(400, "Empty resume")
    key = _ck("analyze", text)
    cached = _get(key)
    if cached:
        return cached

    system = """You are an expert AI resume analyzer. Return ONLY valid JSON:
{
  "candidate_score": <0-100>,
  "experience_level": "<junior|mid|senior|lead|executive>",
  "score_breakdown": {
    "skills_depth": <0-100>,
    "project_impact": <0-100>,
    "experience_alignment": <0-100>,
    "education_strength": <0-100>,
    "communication_signal": <0-100>,
    "growth_signal": <0-100>
  },
  "skills": {"technical": [], "soft": [], "tools": []},
  "strengths": [],
  "weaknesses": [],
  "projects": [{"name":"","complexity":"<low|medium|high>","impact":""}],
  "career_trajectory": "<growing|stable|declining|pivoting>",
  "domain_expertise": [],
  "education_quality": <0-100>,
  "summary": "2-3 sentence summary",
  "recommendations": [],
  "graph_insights": ["short insight for radar/KPI interpretation"],
  "recruiter_notes": ["specific screening note"]
}
Analyze depth, not just presence. Focus on growth potential, concrete evidence, and explainable scores."""
    result = await ask_ai(system, f"Analyze this resume:\n\n{text}")
    _set(key, result)
    return result


@app.post("/api/match")
async def match(req: MatchRequest):
    if not req.resume_text.strip() or not req.job_description.strip():
        raise HTTPException(400, "Both fields required")
    key = _ck("match", req.resume_text, req.job_description)
    cached = _get(key)
    if cached:
        return cached

    system = """You are an AI recruiting analyst. Go beyond keywords and analyze depth, relevance, and growth.
Return ONLY valid JSON:
{
  "match_score": <0-100>,
  "confidence": <0.0-1.0>,
  "overall_fit": "<excellent|strong|good|moderate|weak>",
  "key_strengths": [],
  "skill_gaps": [],
  "experience_alignment": <0-100>,
  "skills_match": <0-100>,
  "culture_fit": <0-100>,
  "growth_potential": <0-100>,
  "skill_breakdown": [{"skill":"","required_level":"","candidate_level":"","match":<0-100>}],
  "recommendations": [],
  "explanation": "Detailed reasoning",
  "hiring_suggestion": "<strong_hire|hire|maybe|pass>"
}"""
    result = await ask_ai(system, f"RESUME:\n{req.resume_text}\n\nJOB:\n{req.job_description}")
    _set(key, result)
    return result


@app.post("/api/interview")
async def interview(req: InterviewRequest):
    system = f"""You are an AI interviewer for {req.role}. Difficulty: {req.difficulty}.
Be professional, adaptive, and encouraging. Return ONLY valid JSON:
{{
  "response": "Your question or response",
  "feedback": "Feedback on previous answer or null",
  "score": null,
  "difficulty_adjustment": "<same|increase|decrease>",
  "question_type": "<technical|behavioral|situational|follow-up>",
  "topics_covered": [],
  "interview_complete": false,
  "final_score": null,
  "metrics": {{"technical": null, "communication": null, "problem_solving": null}},
  "weaknesses": [],
  "improvement_plan": []
}}
If user wants to end, set interview_complete=true and populate final_score, metrics, weaknesses, and improvement_plan."""

    history_lines = []
    for item in (req.history or [])[-16:]:
        if isinstance(item, dict):
            role = str(item.get("role", "user")).upper()
            content = item.get("content", "")
        else:
            role = "USER"
            content = str(item)
        if content:
            history_lines.append(f"{role}: {content}")
    if not history_lines or req.message not in history_lines[-1]:
        history_lines.append(f"USER: {req.message}")

    transcript = "Conversation so far:\n" + "\n".join(history_lines)
    return await ask_ai(system, transcript, json_mode=True, temperature=0.8)


@app.post("/api/detect-bias")
async def detect_bias(req: BiasRequest):
    if not req.job_description.strip():
        raise HTTPException(400, "Job description required")
    key = _ck("bias", req.job_description)
    cached = _get(key)
    if cached:
        return cached

    system = """Analyze the job description for ALL bias: gender, age, racial, disability, and exclusionary language.
Return ONLY valid JSON:
{
  "bias_score": <0-100, 0=none>,
  "bias_level": "<none|low|moderate|high|severe>",
  "issues": [{"type":"","original_text":"","explanation":"","suggestion":"","severity":"<low|medium|high>"}],
  "improved_description": "Full improved version",
  "inclusivity_score": <0-100>,
  "summary": "Overall assessment"
}"""
    result = await ask_ai(system, f"Analyze for bias:\n\n{req.job_description}")
    _set(key, result)
    return result


@app.post("/api/generate-outreach")
async def outreach(req: OutreachRequest):
    system = f"""You are an expert recruiter. Tone: {req.tone}. Create personalized outreach.
Return ONLY valid JSON:
{{
  "subject_line": "",
  "message": "",
  "follow_up": "",
  "linkedin_version": "",
  "personalization_score": <0-100>,
  "tips": []
}}"""
    return await ask_ai(
        system,
        f"Candidate: {req.candidate_name}\nSkills: {req.candidate_skills}\nRole: {req.target_role}\nCompany: {req.company_name}",
    )


@app.post("/api/career-coach")
async def coach(req: CoachRequest):
    key = _ck("coach", req.current_skills, req.target_role)
    cached = _get(key)
    if cached:
        return cached

    system = """You are an AI career coach. Return ONLY valid JSON:
{
  "readiness_score": <0-100>,
  "current_level": "",
  "target_level": "",
  "gap_analysis": [{"skill":"","current":<0-100>,"required":<0-100>,"priority":"<critical|high|medium|low>"}],
  "learning_roadmap": [{"phase":1,"title":"","duration":"","tasks":[],"resources":[]}],
  "recommended_courses": [{"name":"","platform":"","relevance":""}],
  "project_ideas": [{"title":"","description":"","skills_practiced":[]}],
  "timeline": "",
  "motivation": ""
}"""
    result = await ask_ai(system, f"Skills: {req.current_skills}\nTarget: {req.target_role}\nLevel: {req.experience_level}")
    _set(key, result)
    return result


frontend = pathlib.Path(__file__).parent.parent
if (frontend / "index.html").exists():
    app.mount("/", StaticFiles(directory=str(frontend), html=True), name="static")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
