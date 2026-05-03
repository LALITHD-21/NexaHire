"""
NexaHire AI - Backend API Server
FastAPI backend with OpenAI and Gemini provider support.
"""

import hashlib
import io
import json
import os
import pathlib
import re
import time
from datetime import datetime

import httpx

import logging

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

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

DEFAULT_PROVIDER = (os.getenv("AI_PROVIDER", "openai") or "openai").lower()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") or os.getenv("CHATGPT_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY", "")
MODEL = os.getenv("MODEL", "gpt-4.1-mini")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
MAX_TOKENS = int(os.getenv("MAX_TOKENS", "2000"))
CACHE_TTL = int(os.getenv("CACHE_TTL", "3600"))
OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions"
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"

if not OPENAI_API_KEY:
    print("WARNING: OPENAI_API_KEY not set. OpenAI calls need a browser key or server env key.")
if not GEMINI_API_KEY:
    print("WARNING: GEMINI_API_KEY not set. Gemini calls need a browser key or server env key.")

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


app = FastAPI(title="NexaHire AI", version="1.0.0", description="AI-powered recruiting platform.")
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "x-ai-provider", "x-ai-model", "x-ai-key"],
)


class MatchRequest(BaseModel):
    resume_text: str = Field(..., min_length=10, description="Candidate resume text")
    job_description: str = Field(..., min_length=10, description="Job description text")


class InterviewRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User's input message")
    role: str = Field(default="Software Engineer", max_length=100)
    history: list = Field(default_factory=list)
    difficulty: str = Field(default="medium", pattern="^(easy|medium|hard)$")


class BiasRequest(BaseModel):
    job_description: str = Field(..., min_length=10, description="Job description to analyze")


class OutreachRequest(BaseModel):
    candidate_name: str = Field(..., min_length=1, max_length=100)
    candidate_skills: str = Field(..., min_length=1)
    target_role: str = Field(..., min_length=1, max_length=100)
    company_name: str = Field(default="Our Company", max_length=100)
    tone: str = Field(default="professional", pattern="^(professional|casual|enthusiastic)$")


class CoachRequest(BaseModel):
    current_skills: str = Field(..., min_length=1)
    target_role: str = Field(..., min_length=1, max_length=100)
    experience_level: str = Field(default="mid", pattern="^(junior|mid|senior|lead|executive)$")


class AIConfigRequest(BaseModel):
    provider: str = Field(default="openai")
    model: str = Field(default="")
    api_key: str = Field(default="")


class EmbeddingRequest(BaseModel):
    text: str = Field(..., min_length=2, description="Text to generate embeddings for")


class MarketRequest(BaseModel):
    role: str = Field(..., min_length=2, description="Target role to search")
    location: str = Field(default="Global", description="Location to ground the search")


def normalize_provider(provider: str = "") -> str:
    value = (provider or DEFAULT_PROVIDER or "openai").strip().lower()
    if value in {"gemini", "google", "google-gemini"}:
        return "gemini"
    return "openai"


def resolve_ai_config(request: Request | None = None, override: AIConfigRequest | None = None):
    headers = request.headers if request else {}
    provider = normalize_provider(
        (override.provider if override else "")
        or headers.get("x-ai-provider")
        or DEFAULT_PROVIDER
    )

    model = (
        (override.model if override else "")
        or headers.get("x-ai-model")
        or (GEMINI_MODEL if provider == "gemini" else MODEL)
    ).strip()

    api_key = (
        (override.api_key if override else "")
        or headers.get("x-ai-key")
        or (GEMINI_API_KEY if provider == "gemini" else OPENAI_API_KEY)
    ).strip()

    if not model:
        model = GEMINI_MODEL if provider == "gemini" else MODEL

    return {"provider": provider, "model": model, "api_key": api_key}


def extract_gemini_text(data):
    candidates = data.get("candidates") or []
    if not candidates:
        return ""
    parts = (((candidates[0].get("content") or {}).get("parts")) or [])
    return "".join(str(part.get("text", "")) for part in parts).strip()


def parse_json_text(text):
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        return json.loads(match.group()) if match else {"error": "Parse failed", "raw": text}


async def ask_ai(system: str, user: str, json_mode=True, temperature=0.7, config=None):
    config = config or resolve_ai_config()
    provider = config["provider"]
    model = config["model"]
    api_key = config["api_key"]

    if not api_key:
        raise HTTPException(status_code=500, detail=f"{provider.title()} API key is not configured")

    if provider == "gemini":
        return await ask_gemini(system, user, json_mode, temperature, model, api_key)
    return await ask_openai(system, user, json_mode, temperature, model, api_key)


async def ask_openai(system: str, user: str, json_mode=True, temperature=0.7, model=MODEL, api_key=OPENAI_API_KEY):
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key is not configured")

    try:
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            "temperature": temperature,
            "max_tokens": MAX_TOKENS,
        }
        if json_mode:
            payload["response_format"] = {"type": "json_object"}

        async with httpx.AsyncClient(timeout=90.0) as client:
            response = await client.post(
                OPENAI_CHAT_URL,
                json=payload,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
            )
            response.raise_for_status()
            data = response.json()

        text = (((data.get("choices") or [{}])[0].get("message") or {}).get("content") or "").strip()
        if json_mode:
            return parse_json_text(text)
        return {"response": text}
    except httpx.HTTPStatusError as exc:
        try:
            raw = exc.response.text
            message = (json.loads(raw).get("error") or {}).get("message") or raw
        except Exception:
            message = exc.response.text or str(exc)
        raise HTTPException(status_code=exc.response.status_code, detail=f"OpenAI Error: {message}")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"OpenAI Error: {str(exc)}")


async def ask_gemini(system: str, user: str, json_mode=True, temperature=0.7, model=GEMINI_MODEL, api_key=GEMINI_API_KEY):
    if not api_key:
        raise HTTPException(status_code=500, detail="Gemini API key is not configured")

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        
        generation_config = {
            "temperature": temperature,
            "max_output_tokens": MAX_TOKENS,
        }
        if json_mode:
            generation_config["response_mime_type"] = "application/json"
            
        m = genai.GenerativeModel(
            model_name=model,
            system_instruction=system,
            generation_config=generation_config
        )
        response = await m.generate_content_async(user)
        text = response.text
        if json_mode:
            return parse_json_text(text)
        return {"response": text}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Gemini Error: {str(exc)}")


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
        "provider": DEFAULT_PROVIDER,
        "model": GEMINI_MODEL if DEFAULT_PROVIDER == "gemini" else MODEL,
        "version": "1.0.0",
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "provider": DEFAULT_PROVIDER,
        "model": GEMINI_MODEL if DEFAULT_PROVIDER == "gemini" else MODEL,
        "api_key_configured": bool(GEMINI_API_KEY if DEFAULT_PROVIDER == "gemini" else OPENAI_API_KEY),
        "providers": {
            "openai": bool(OPENAI_API_KEY),
            "gemini": bool(GEMINI_API_KEY),
        },
        "ts": datetime.now().isoformat(),
        "pdf": PDF_SUPPORT,
        "docx": DOCX_SUPPORT,
    }


@app.post("/api/ai/verify")
async def verify_ai(req: AIConfigRequest, request: Request):
    """
    Verify the AI configuration and API keys.
    """
    config = resolve_ai_config(request, req)
    if not config["api_key"]:
        raise HTTPException(status_code=400, detail=f"{config['provider'].title()} API key is required")

    result = await ask_ai(
        "You verify AI model connectivity. Reply only with a short plain-text OK message.",
        "Reply with: OK",
        json_mode=False,
        temperature=0,
        config=config,
    )

    return {
        "status": "ready",
        "provider": config["provider"],
        "model": config["model"],
        "message": (result.get("response") or "OK").strip()[:120],
        "verified_at": datetime.now().isoformat(),
    }


@app.post("/api/embedding")
async def generate_embedding(req: EmbeddingRequest, request: Request):
    """
    Generate embeddings using Google Services (Gemini text-embedding-004).
    """
    config = resolve_ai_config(request)
    if config["provider"] != "gemini":
        raise HTTPException(400, "Embeddings currently require the Gemini provider.")
    
    if not config["api_key"]:
        raise HTTPException(status_code=500, detail="Gemini API key is not configured")
        
    try:
        import google.generativeai as genai
        genai.configure(api_key=config["api_key"])
        
        result = genai.embed_content(
            model="models/text-embedding-004",
            content=req.text,
            task_type="retrieval_document"
        )
        return {
            "embedding": result['embedding'],
            "model": "models/text-embedding-004",
            "provider": "google-gemini",
            "text_length": len(req.text)
        }
    except Exception as exc:
        logger.error(f"Embedding failed: {exc}")
        raise HTTPException(status_code=500, detail=f"Embedding Error: {str(exc)}")


@app.post("/api/market-insights")
async def market_insights(req: MarketRequest, request: Request):
    """
    Hackathon Winning Feature: Market Insights.
    Uses Gemini to analyze real-time market demand, average salary, and top skills for a role.
    """
    config = resolve_ai_config(request)
    
    system = """You are an expert technical recruiter and labor market analyst. 
Return ONLY valid JSON with this exact schema:
{
  "average_salary": "e.g., $120k - $160k",
  "market_demand": "<High|Medium|Low>",
  "top_skills": ["skill1", "skill2", "skill3"],
  "recent_trends": "Short paragraph on hiring trends for this role",
  "remote_flexibility": "<High|Medium|Low>",
  "growth_projection": "e.g., 14% over 5 years"
}"""
    prompt = f"Analyze the current market for the role of '{req.role}' in the location '{req.location}'."
    
    return await ask_ai(system, prompt, json_mode=True, temperature=0.2, config=config)


@app.post("/api/analyze-resume")
async def analyze_resume(request: Request, file: UploadFile = File(...)):
    config = resolve_ai_config(request)
    text = parse_file(file)
    if not text.strip():
        raise HTTPException(400, "Empty resume")
    key = _ck("analyze", config["provider"], config["model"], text)
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
    result = await ask_ai(system, f"Analyze this resume:\n\n{text}", config=config)
    _set(key, result)
    return result


@app.post("/api/match")
async def match(req: MatchRequest, request: Request):
    config = resolve_ai_config(request)
    if not req.resume_text.strip() or not req.job_description.strip():
        raise HTTPException(400, "Both fields required")
    key = _ck("match", config["provider"], config["model"], req.resume_text, req.job_description)
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
    result = await ask_ai(system, f"RESUME:\n{req.resume_text}\n\nJOB:\n{req.job_description}", config=config)
    _set(key, result)
    return result


@app.post("/api/interview")
async def interview(req: InterviewRequest, request: Request):
    config = resolve_ai_config(request)
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
    return await ask_ai(system, transcript, json_mode=True, temperature=0.8, config=config)


@app.post("/api/detect-bias")
async def detect_bias(req: BiasRequest, request: Request):
    config = resolve_ai_config(request)
    if not req.job_description.strip():
        raise HTTPException(400, "Job description required")
    key = _ck("bias", config["provider"], config["model"], req.job_description)
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
    result = await ask_ai(system, f"Analyze for bias:\n\n{req.job_description}", config=config)
    _set(key, result)
    return result


@app.post("/api/generate-outreach")
async def outreach(req: OutreachRequest, request: Request):
    config = resolve_ai_config(request)
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
        config=config,
    )


@app.post("/api/career-coach")
async def coach(req: CoachRequest, request: Request):
    config = resolve_ai_config(request)
    key = _ck("coach", config["provider"], config["model"], req.current_skills, req.target_role)
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
    result = await ask_ai(system, f"Skills: {req.current_skills}\nTarget: {req.target_role}\nLevel: {req.experience_level}", config=config)
    _set(key, result)
    return result


frontend = pathlib.Path(__file__).parent.parent
if (frontend / "index.html").exists():
    app.mount("/", StaticFiles(directory=str(frontend), html=True), name="static")

if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app:app", host="0.0.0.0", port=port)
