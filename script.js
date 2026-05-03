const API = window.location.protocol === "file:"
  ? "http://localhost:8000"
  : "";

const ACTIVITY_KEY = "nexahire.activity.v1";
const THEME_KEY = "nexahire.theme.v1";
const PROFILE_KEY = "nexahire.profile.v1";
const AI_SETTINGS_KEY = "nexahire.ai.settings.v1";
let lastResumeFileName = "";

const aiModelOptions = {
  openai: [
    { value: "gpt-4.1-mini", label: "GPT-4.1 Mini" },
    { value: "gpt-4.1", label: "GPT-4.1" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "gpt-4o", label: "GPT-4o" }
  ],
  gemini: [
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
    { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
    { value: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash-Lite" }
  ]
};

const sampleData = {
  match: {
    resume: "Alex Chen is a senior software engineer with 7 years of experience building AI-enabled SaaS products. Skills include Python, TypeScript, React, FastAPI, PostgreSQL, AWS, vector search, evaluation pipelines, and ML model deployment. Alex led a team of 5 engineers to launch a candidate-matching platform, reduced inference latency by 42%, and partnered with product and design on analytics dashboards.",
    job: "We are hiring a Senior AI Engineer to build production AI workflows for recruiting intelligence. The role requires Python, TypeScript, cloud deployment, API design, evaluation methods, data privacy awareness, strong communication, and experience leading complex product launches."
  },
  bias: "We need a young, aggressive rockstar developer who can dominate under pressure. The ideal candidate should be a native English speaker, able-bodied, and willing to work long hours with no family distractions. Recent graduates preferred.",
  coach: {
    skills: "Python, JavaScript, React, SQL, REST APIs, basic machine learning, Docker, communication, stakeholder management",
    role: "Senior AI Engineer",
    level: "mid"
  },
  outreach: {
    name: "Alex Chen",
    skills: "Python, AWS, React, FastAPI, vector search, ML deployment, engineering leadership",
    role: "Senior AI Engineer",
    company: "NexaHire AI",
    tone: "professional"
  }
};

const commandActions = [
  { label: "Analyze Resume", detail: "Upload and score a candidate resume", page: "analyze" },
  { label: "Smart Match", detail: "Compare resume text against a role", page: "match" },
  { label: "AI Interview", detail: "Run an adaptive interview session", page: "interview" },
  { label: "Bias Review", detail: "Find and rewrite exclusionary language", page: "bias" },
  { label: "Career Roadmap", detail: "Generate a skill-gap plan", page: "coach" },
  { label: "Outreach Sequence", detail: "Create email, InMail, and follow-up copy", page: "outreach" },
  { label: "Load Match Demo", detail: "Populate candidate and role sample data", action: () => loadSample("match") },
  { label: "Load Bias Demo", detail: "Populate a job description for review", action: () => loadSample("bias") },
  { label: "Load Roadmap Demo", detail: "Populate career coach inputs", action: () => loadSample("coach") },
  { label: "Load Outreach Demo", detail: "Populate recruiter message inputs", action: () => loadSample("outreach") }
];

const jobRequirements = [
  {
    company: "OpenAI",
    initials: "OA",
    role: "Software Engineer, Applied AI",
    location: "San Francisco / Remote",
    match: 96,
    urgency: "New signal",
    skills: ["Python", "Distributed systems", "Product AI"],
    logo: "https://www.google.com/s2/favicons?domain=openai.com&sz=96",
    url: "https://openai.com/careers/search/"
  },
  {
    company: "Google",
    initials: "G",
    role: "Software Engineer, Cloud AI",
    location: "Bengaluru / US",
    match: 92,
    urgency: "Hiring now",
    skills: ["Go", "Cloud", "Data systems"],
    logo: "https://www.google.com/s2/favicons?domain=google.com&sz=96",
    url: "https://www.google.com/about/careers/applications/jobs/results?hl=en_US"
  },
  {
    company: "Microsoft",
    initials: "MS",
    role: "AI Platform Engineer",
    location: "Global",
    match: 90,
    urgency: "Priority",
    skills: ["Azure", "C#", "Responsible AI"],
    logo: "https://www.google.com/s2/favicons?domain=microsoft.com&sz=96",
    url: "https://careers.microsoft.com/"
  },
  {
    company: "Stripe",
    initials: "ST",
    role: "Backend Engineer, Infrastructure",
    location: "US / EMEA",
    match: 88,
    urgency: "Fresh role",
    skills: ["APIs", "Reliability", "Payments"],
    logo: "https://www.google.com/s2/favicons?domain=stripe.com&sz=96",
    url: "https://stripe.com/jobs/search"
  },
  {
    company: "Apple",
    initials: "AP",
    role: "AIML Software Engineer",
    location: "United States",
    match: 86,
    urgency: "Open roles",
    skills: ["Swift", "ML", "Privacy"],
    logo: "https://www.google.com/s2/favicons?domain=apple.com&sz=96",
    url: "https://www.apple.com/careers/us/"
  }
];

document.addEventListener("DOMContentLoaded", () => {
  initIntro();
  initParticles();
  initNavigation();
  initCommandSearch();
  initThemeToggle();
  initAISettings();
  initProfileBuilder();
  loadProfile();
  initResumeUpload();
  renderLiveJobs();
  startLiveJobTicker();
  renderActivity();
  console.log("NexaHire AI loaded");
});

function initIntro() {
  const intro = document.getElementById("intro-screen");
  const stage = document.getElementById("intro-stage");
  const modules = Array.from(document.querySelectorAll("#intro-modules span"));
  if (!intro) return;

  const stages = [
    "Starting NexaHire launch sequence",
    "Lighting resume intelligence graph",
    "Calibrating explainable match scores",
    "Connecting Google-ready workflow handoffs",
    "Opening command center"
  ];

  let index = 0;
  const timer = setInterval(() => {
    index = Math.min(index + 1, stages.length - 1);
    if (stage) stage.textContent = stages[index];
    modules.forEach((item, itemIndex) => {
      item.classList.toggle("active", itemIndex === Math.min(index, modules.length - 1));
    });
  }, 720);

  window.addEventListener("load", () => {
    setTimeout(() => {
      clearInterval(timer);
      intro.style.opacity = "0";
      intro.style.visibility = "hidden";
      setTimeout(() => intro.remove(), 900);
    }, 3600);
  });
}

function initParticles() {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.getElementById("particles-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const palette = [
    [46, 231, 200],
    [255, 184, 77],
    [255, 92, 138],
    [108, 99, 255]
  ];
  let particles = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const count = Math.min(90, Math.max(38, Math.floor((canvas.width * canvas.height) / 22000)));
    particles = Array.from({ length: count }, () => createParticle());
  }

  function createParticle() {
    const color = palette[Math.floor(Math.random() * palette.length)];
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.7 + 0.5,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      alpha: Math.random() * 0.42 + 0.12,
      color
    };
  }

  function drawParticle(p) {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < -20 || p.x > canvas.width + 20 || p.y < -20 || p.y > canvas.height + 20) {
      Object.assign(p, createParticle());
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.color[0]},${p.color[1]},${p.color[2]},${p.alpha})`;
    ctx.fill();
  }

  function connectParticles() {
    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 118) {
          const alpha = 0.085 * (1 - distance / 118);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(drawParticle);
    connectParticles();
    requestAnimationFrame(animate);
  }

  resize();
  window.addEventListener("resize", resize);
  animate();
}

function initNavigation() {
  document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", () => navigateTo(item.dataset.page));
  });
}

function applyTheme(theme) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = nextTheme;

  const toggle = document.getElementById("theme-toggle");
  const label = document.getElementById("theme-label");
  if (toggle) toggle.setAttribute("aria-pressed", String(nextTheme === "dark"));
  if (label) label.textContent = nextTheme === "dark" ? "Dark" : "Light";
}

function initThemeToggle() {
  const savedTheme = localStorage.getItem(THEME_KEY) || "light";
  applyTheme(savedTheme);

  const toggle = document.getElementById("theme-toggle");
  if (!toggle) return;

  toggle.addEventListener("click", () => {
    const current = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    const nextTheme = current === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, nextTheme);
    applyTheme(nextTheme);
    toast(`${nextTheme === "dark" ? "Dark" : "Light"} theme enabled.`, "success");
  });
}

function getAISettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(AI_SETTINGS_KEY) || "{}");
    const provider = saved.provider === "gemini" ? "gemini" : "openai";
    const fallbackModel = aiModelOptions[provider][0].value;
    return {
      provider,
      model: saved.model || fallbackModel,
      apiKey: saved.apiKey || "",
      verified: Boolean(saved.verified),
      verifiedAt: saved.verifiedAt || ""
    };
  } catch (error) {
    return { provider: "openai", model: "gpt-4.1-mini", apiKey: "", verified: false, verifiedAt: "" };
  }
}

function saveAISettingsData(settings) {
  localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(settings));
}

function getAIHeaders() {
  const settings = getAISettings();
  const headers = {
    "X-AI-Provider": settings.provider,
    "X-AI-Model": settings.model
  };
  if (settings.apiKey) headers["X-AI-Key"] = settings.apiKey;
  return headers;
}

function syncAIModelOptions(provider, selectedModel = "") {
  const select = document.getElementById("ai-model-select");
  if (!select) return;
  const options = aiModelOptions[provider] || aiModelOptions.openai;
  select.innerHTML = options.map(model => `<option value="${escapeHtml(model.value)}">${escapeHtml(model.label)}</option>`).join("");
  select.value = options.some(model => model.value === selectedModel) ? selectedModel : options[0].value;
}

function updateAIProviderButtons(provider) {
  document.querySelectorAll("[data-ai-provider]").forEach(button => {
    button.classList.toggle("active", button.dataset.aiProvider === provider);
  });
}

function setAIStatus(title, detail, state = "info") {
  const card = document.getElementById("ai-status-card");
  const titleEl = document.getElementById("ai-status-title");
  const detailEl = document.getElementById("ai-status-detail");
  const global = document.getElementById("global-ai-status");
  const globalText = document.getElementById("global-ai-status-text");

  if (titleEl) titleEl.textContent = title;
  if (detailEl) detailEl.textContent = detail;
  if (card) {
    card.classList.toggle("ready", state === "ready");
    card.classList.toggle("error", state === "error");
  }
  if (global) {
    global.classList.toggle("error", state === "error");
    global.classList.toggle("ready", state === "ready");
  }
  if (globalText) globalText.textContent = title;
}

function initAISettings() {
  const settings = getAISettings();
  const keyInput = document.getElementById("ai-api-key");
  const select = document.getElementById("ai-model-select");

  syncAIModelOptions(settings.provider, settings.model);
  updateAIProviderButtons(settings.provider);
  if (keyInput) keyInput.value = settings.apiKey;

  document.querySelectorAll("[data-ai-provider]").forEach(button => {
    button.addEventListener("click", () => {
      const provider = button.dataset.aiProvider === "gemini" ? "gemini" : "openai";
      const nextModel = aiModelOptions[provider][0].value;
      updateAIProviderButtons(provider);
      syncAIModelOptions(provider, nextModel);
      const current = getAISettings();
      saveAISettingsData({ ...current, provider, model: nextModel, verified: false, verifiedAt: "" });
      setAIStatus("Not verified", `${provider === "gemini" ? "Gemini" : "OpenAI"} key is ready to check.`, "info");
    });
  });

  if (select) {
    select.addEventListener("change", () => {
      const current = getAISettings();
      saveAISettingsData({ ...current, model: select.value, verified: false, verifiedAt: "" });
      setAIStatus("Not verified", `${select.value} selected.`, "info");
    });
  }

  if (settings.verified) {
    setAIStatus("Model verified", `${settings.provider.toUpperCase()} - ${settings.model}`, "ready");
  } else {
    refreshAIHealth();
  }
}

function readAISettingsForm() {
  const activeProvider = document.querySelector("[data-ai-provider].active");
  const select = document.getElementById("ai-model-select");
  const keyInput = document.getElementById("ai-api-key");
  const provider = activeProvider && activeProvider.dataset.aiProvider === "gemini" ? "gemini" : "openai";
  return {
    provider,
    model: select ? select.value : aiModelOptions[provider][0].value,
    apiKey: keyInput ? keyInput.value.trim() : "",
    verified: false,
    verifiedAt: ""
  };
}

function saveAISettings() {
  const settings = readAISettingsForm();
  saveAISettingsData(settings);
  setAIStatus("Saved, not verified", `${settings.provider.toUpperCase()} - ${settings.model}`, "info");
  toast("AI settings saved.", "success");
}

function clearAISettings() {
  localStorage.removeItem(AI_SETTINGS_KEY);
  const keyInput = document.getElementById("ai-api-key");
  if (keyInput) keyInput.value = "";
  syncAIModelOptions("openai", "gpt-4.1-mini");
  updateAIProviderButtons("openai");
  setAIStatus("Cleared", "Using server fallback when configured.", "info");
  toast("AI key cleared from this browser.", "info");
}

async function refreshAIHealth() {
  try {
    const response = await fetch(API + "/health");
    const data = await response.json();
    if (data.api_key_configured) {
      setAIStatus("Server key ready", `${String(data.provider || "openai").toUpperCase()} - ${data.model || "default"}`, "ready");
    } else {
      setAIStatus("Not verified", "Add an OpenAI or Gemini key to run AI modules.", "info");
    }
  } catch (error) {
    setAIStatus("Status unavailable", "Backend health check failed.", "error");
  }
}

async function verifyAISettings() {
  const settings = readAISettingsForm();
  saveAISettingsData(settings);
  const restore = setButtonLoading(document.getElementById("ai-verify-btn"), "Verifying");

  try {
    const response = await fetch(API + "/api/ai/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAIHeaders() },
      body: JSON.stringify({
        provider: settings.provider,
        model: settings.model,
        api_key: settings.apiKey
      })
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(error.detail || "Verification failed");
    }
    const data = await response.json();
    const verified = {
      ...settings,
      provider: data.provider || settings.provider,
      model: data.model || settings.model,
      verified: true,
      verifiedAt: data.verified_at || new Date().toISOString()
    };
    saveAISettingsData(verified);
    setAIStatus("Model verified", `${verified.provider.toUpperCase()} - ${verified.model}`, "ready");
    toast("AI model verified.", "success");
  } catch (error) {
    setAIStatus("Verification failed", error.message, "error");
    toast(error.message, "error");
  } finally {
    restore();
  }
}

function initProfileBuilder() {
  const photoInput = document.getElementById("profile-photo-input");
  if (!photoInput) return;

  photoInput.addEventListener("change", event => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast("Please select an image file.", "error");
      return;
    }
    if (file.size > 2500000) {
      toast("Use a profile photo under 2.5 MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const profile = { ...getProfile(), photo: reader.result };
      if (!saveProfileData(profile, false)) return;
      updateProfilePreview(profile);
      saveActivity("Profile photo updated", "Workspace profile image refreshed.", "home");
      toast("Profile photo added.", "success");
    };
    reader.readAsDataURL(file);
  });
}

function getProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
  } catch (error) {
    return {};
  }
}

function hasSavedProfile(profile = getProfile()) {
  return Boolean(profile.name || profile.role || profile.location || profile.email || profile.link || profile.headline);
}

function profileFallbacks(profile = {}) {
  return {
    name: profile.name || "Create your NexaHire profile",
    role: profile.role || "Talent Partner",
    location: profile.location || "Remote",
    email: profile.email || "",
    link: profile.link || "",
    headline: profile.headline || "Add your photo, role, contact basics, and recruiting focus to personalize the workspace.",
    photo: profile.photo || "assets/nexahire-mark.svg"
  };
}

function setInputValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value || "";
}

function getProfileFromForm() {
  const existing = getProfile();
  const getValue = id => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  };

  return {
    name: getValue("profile-name"),
    role: getValue("profile-role"),
    location: getValue("profile-location"),
    email: getValue("profile-email"),
    link: getValue("profile-link"),
    headline: getValue("profile-headline"),
    photo: existing.photo || ""
  };
}

function saveProfileData(profile, showToast = true) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    if (showToast) toast("Profile saved.", "success");
    return true;
  } catch (error) {
    toast("Profile is too large to save locally. Try a smaller photo.", "error");
    return false;
  }
}

function loadProfile() {
  const profile = getProfile();
  setInputValue("profile-name", profile.name);
  setInputValue("profile-role", profile.role);
  setInputValue("profile-location", profile.location);
  setInputValue("profile-email", profile.email);
  setInputValue("profile-link", profile.link);
  setInputValue("profile-headline", profile.headline);
  updateProfilePreview(profile);
  if (hasSavedProfile(profile)) hideProfileStudio();
  else showProfileStudio(false);
}

function updateProfilePreview(profile = {}) {
  const data = profileFallbacks(profile);
  const previewPhoto = document.getElementById("profile-preview-photo");
  const sidebarPhoto = document.getElementById("sidebar-profile-photo");
  const previewName = document.getElementById("profile-preview-name");
  const previewHeadline = document.getElementById("profile-preview-headline");
  const previewRole = document.getElementById("profile-preview-role");
  const previewLocation = document.getElementById("profile-preview-location");
  const sidebarName = document.getElementById("sidebar-profile-name");
  const sidebarRole = document.getElementById("sidebar-profile-role");

  if (previewPhoto) previewPhoto.src = data.photo;
  if (sidebarPhoto) sidebarPhoto.src = data.photo;
  if (previewName) previewName.textContent = data.name;
  if (previewHeadline) previewHeadline.textContent = data.headline;
  if (previewRole) previewRole.textContent = data.role;
  if (previewLocation) previewLocation.textContent = data.location;
  if (sidebarName) sidebarName.textContent = profile.name || "Build Profile";
  if (sidebarRole) sidebarRole.textContent = profile.role || "Recruiter workspace";
}

function saveProfile() {
  const profile = getProfileFromForm();
  if (!saveProfileData(profile)) return;
  updateProfilePreview(profile);
  hideProfileStudio();
  saveActivity("Profile updated", `${profile.name || "Recruiter"} profile saved with ${profile.role || "workspace"} details.`, "home");
}

function showProfileStudio(shouldScroll = true) {
  const studio = document.getElementById("profile-studio");
  if (!studio) return;
  navigateTo("home");
  studio.classList.remove("hidden");
  if (shouldScroll) studio.scrollIntoView({ behavior: "smooth", block: "center" });
}

function hideProfileStudio() {
  const studio = document.getElementById("profile-studio");
  if (studio) studio.classList.add("hidden");
}

async function copyProfile() {
  const data = profileFallbacks(getProfileFromForm());
  const lines = [
    data.name,
    data.role,
    data.location,
    data.email ? `Email: ${data.email}` : "",
    data.link ? `Profile: ${data.link}` : "",
    "",
    data.headline
  ].filter(line => line !== "");

  await writeClipboard(lines.join("\n"));
  toast("Profile copied.", "success");
}

function navigateTo(page) {
  document.querySelectorAll(".page").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));

  const target = document.getElementById(`page-${page}`);
  const nav = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (target) target.classList.add("active");
  if (nav) nav.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function initCommandSearch() {
  const input = document.getElementById("command-search");
  const results = document.getElementById("command-results");
  if (!input || !results) return;

  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    if (!query) {
      results.classList.add("hidden");
      results.innerHTML = "";
      return;
    }

    const matches = commandActions
      .filter(action => `${action.label} ${action.detail}`.toLowerCase().includes(query))
      .slice(0, 6);

    results.innerHTML = matches.map((action, index) => `
      <button class="command-result" type="button" data-command-index="${index}">
        <span><strong>${escapeHtml(action.label)}</strong><br><small>${escapeHtml(action.detail)}</small></span>
        <small>Open</small>
      </button>
    `).join("");

    results.querySelectorAll(".command-result").forEach((button, index) => {
      button.addEventListener("click", () => {
        const action = matches[index];
        if (action.page) navigateTo(action.page);
        if (action.action) action.action();
        input.value = "";
        results.innerHTML = "";
        results.classList.add("hidden");
      });
    });

    results.classList.toggle("hidden", matches.length === 0);
  });

  document.addEventListener("click", event => {
    if (!event.target.closest(".command-box")) results.classList.add("hidden");
  });
}

function initResumeUpload() {
  const dropZone = document.getElementById("drop-zone");
  const fileInput = document.getElementById("file-input");
  if (!dropZone || !fileInput) return;

  if (!dropZone.dataset.uploadBound) {
    dropZone.addEventListener("click", () => {
      const input = document.getElementById("file-input");
      if (input) input.click();
    });
    dropZone.addEventListener("dragover", event => {
      event.preventDefault();
      dropZone.classList.add("dragover");
    });
    dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
    dropZone.addEventListener("drop", event => {
      event.preventDefault();
      dropZone.classList.remove("dragover");
      if (event.dataTransfer.files.length) handleResume(event.dataTransfer.files[0]);
    });
    dropZone.dataset.uploadBound = "true";
  }

  fileInput.onchange = () => {
    if (fileInput.files.length) handleResume(fileInput.files[0]);
  };
}

function toast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const icon = type === "success" ? "OK" : type === "error" ? "!" : "i";
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.innerHTML = `<strong>${icon}</strong><span>${escapeHtml(message)}</span>`;
  container.appendChild(el);

  setTimeout(() => {
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 260);
  }, 3600);
}

function showJobToast(job) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const el = document.createElement("div");
  el.className = "toast info";
  el.innerHTML = `
    <strong>LIVE</strong>
    <span>
      ${escapeHtml(job.company)} requirement: ${escapeHtml(job.role)}
      <br><a href="${escapeHtml(job.url)}" target="_blank" rel="noopener noreferrer">Open company careers</a>
    </span>
  `;
  container.appendChild(el);

  setTimeout(() => {
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 260);
  }, 5200);
}

async function apiCall(endpoint, body, isFormData = false) {
  try {
    const options = { method: "POST" };
    const aiHeaders = getAIHeaders();
    if (isFormData) {
      options.headers = aiHeaders;
      options.body = body;
    } else {
      options.headers = { "Content-Type": "application/json", ...aiHeaders };
      options.body = JSON.stringify(body);
    }

    const response = await fetch(API + endpoint, options);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(error.detail || "API request failed");
    }
    return await response.json();
  } catch (error) {
    toast(error.message, "error");
    throw error;
  }
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value == null ? "" : String(value);
  return div.innerHTML;
}

function formatText(value) {
  return escapeHtml(value || "").replace(/\n/g, "<br>");
}

function clampScore(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return Math.max(0, Math.min(100, Math.round(num)));
}

function humanize(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase());
}

function renderTags(items, cls = "tag-cyan") {
  return (items || [])
    .filter(Boolean)
    .map(item => `<span class="tag ${cls}">${escapeHtml(item)}</span>`)
    .join("");
}

function renderList(items) {
  const list = (items || []).filter(Boolean);
  if (!list.length) return `<div class="list-row">No items returned.</div>`;
  return list.map(item => {
    const text = typeof item === "string"
      ? item
      : Object.entries(item).map(([key, value]) => `${humanize(key)}: ${Array.isArray(value) ? value.join(", ") : value}`).join(" | ");
    return `<div class="list-row">${escapeHtml(text)}</div>`;
  }).join("");
}

function renderSkillBars(items) {
  return (items || []).map(item => {
    const label = item.skill || item.name || "Signal";
    const value = clampScore(item.match ?? item.current ?? item.score ?? 0);
    return `
      <div class="skill-bar">
        <div class="skill-header"><span>${escapeHtml(label)}</span><span>${value}%</span></div>
        <div class="bar"><div class="fill" style="width:${value}%"></div></div>
      </div>
    `;
  }).join("");
}

function loaderMarkup(label = "Working") {
  return `<span class="loader-card"><span class="loader-orbit"></span><span>${escapeHtml(label)}</span></span>`;
}

function setButtonLoading(button, label) {
  if (!button) return () => {};
  const original = button.innerHTML;
  button.disabled = true;
  button.innerHTML = `<span class="button-loader"></span>${escapeHtml(label)}`;
  return () => {
    button.disabled = false;
    button.innerHTML = original;
  };
}

function animateScore(ringId, numId, rawScore) {
  const ring = document.getElementById(ringId);
  const num = document.getElementById(numId);
  if (!ring || !num) return;

  const score = clampScore(rawScore);
  const circumference = 502.6;
  const offset = circumference - (score / 100) * circumference;
  ring.style.strokeDashoffset = offset;

  let current = 0;
  const step = Math.max(1, Math.ceil(score / 36));
  const timer = setInterval(() => {
    current += step;
    if (current >= score) {
      current = score;
      clearInterval(timer);
    }
    num.textContent = current;
  }, 28);
}

async function writeClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    const temp = document.createElement("textarea");
    temp.value = text;
    temp.style.position = "fixed";
    temp.style.opacity = "0";
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    temp.remove();
  }
}

async function copyText(id) {
  const el = document.getElementById(id);
  if (!el) return;
  await writeClipboard(el.innerText || el.textContent || "");
  toast("Copied to clipboard.", "success");
}

async function copySection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  await writeClipboard(el.innerText || el.textContent || "");
  toast("Report copied.", "success");
}

function loadSample(type) {
  if (type === "match") {
    navigateTo("match");
    document.getElementById("match-resume").value = sampleData.match.resume;
    document.getElementById("match-job").value = sampleData.match.job;
  }

  if (type === "bias") {
    navigateTo("bias");
    document.getElementById("bias-input").value = sampleData.bias;
  }

  if (type === "coach") {
    navigateTo("coach");
    document.getElementById("coach-skills").value = sampleData.coach.skills;
    document.getElementById("coach-role").value = sampleData.coach.role;
    document.getElementById("coach-level").value = sampleData.coach.level;
  }

  if (type === "outreach") {
    navigateTo("outreach");
    document.getElementById("out-name").value = sampleData.outreach.name;
    document.getElementById("out-skills").value = sampleData.outreach.skills;
    document.getElementById("out-role").value = sampleData.outreach.role;
    document.getElementById("out-company").value = sampleData.outreach.company;
    document.getElementById("out-tone").value = sampleData.outreach.tone;
  }

  toast("Sample loaded.", "success");
}

function clearModule(type) {
  const map = {
    match: ["match-resume", "match-job"],
    bias: ["bias-input"],
    coach: ["coach-skills", "coach-role"],
    outreach: ["out-name", "out-skills", "out-role", "out-company"]
  };

  (map[type] || []).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  toast("Fields cleared.", "info");
}

function renderLiveJobs() {
  const container = document.getElementById("live-jobs");
  if (!container) return;

  container.innerHTML = jobRequirements.map(job => `
    <article class="job-card">
      <div class="job-top">
        <span class="company-logo-wrap">
          <img src="${escapeHtml(job.logo)}" alt="${escapeHtml(job.company)} logo" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';">
          <span class="logo-fallback">${escapeHtml(job.initials)}</span>
        </span>
        <span class="live-chip"><span class="live-dot"></span>${escapeHtml(job.urgency)}</span>
      </div>
      <div class="job-title-block">
        <p>${escapeHtml(job.company)}</p>
        <h4>${escapeHtml(job.role)}</h4>
      </div>
      <div class="job-meta">
        <span>${escapeHtml(job.location)}</span>
        <span class="match-pill">${clampScore(job.match)}% fit</span>
      </div>
      <div class="job-skills">
        ${job.skills.map(skill => `<span>${escapeHtml(skill)}</span>`).join("")}
      </div>
      <a class="job-link" href="${escapeHtml(job.url)}" target="_blank" rel="noopener noreferrer">View company jobs</a>
    </article>
  `).join("");
}

function startLiveJobTicker() {
  const ribbon = document.getElementById("live-alert-ribbon");
  if (!ribbon || !jobRequirements.length) return;

  let index = 0;
  const update = () => {
    const job = jobRequirements[index % jobRequirements.length];
    ribbon.innerHTML = `
      <span class="alert-company">
        <img src="${escapeHtml(job.logo)}" alt="${escapeHtml(job.company)} logo" loading="lazy">
        <span><strong>${escapeHtml(job.company)}</strong> needs ${escapeHtml(job.role)} - ${clampScore(job.match)}% profile fit</span>
      </span>
      <a href="${escapeHtml(job.url)}" target="_blank" rel="noopener noreferrer">Open link</a>
    `;
    if (index > 0) showJobToast(job);
    index += 1;
  };

  update();
  setInterval(update, 18000);
}

function getActivity() {
  try {
    return JSON.parse(localStorage.getItem(ACTIVITY_KEY) || "[]");
  } catch (error) {
    return [];
  }
}

function saveActivity(title, detail, page) {
  const activity = getActivity();
  activity.unshift({
    title,
    detail,
    page,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity.slice(0, 8)));
  renderActivity();
}

function renderActivity() {
  const feed = document.getElementById("activity-feed");
  if (!feed) return;

  const activity = getActivity();
  const items = activity.length ? activity : [
    { title: "Command center ready", detail: "Run any module to build workspace memory.", page: "home", timestamp: new Date().toISOString() },
    { title: "Bias-aware workflow", detail: "Review role language before final outreach.", page: "bias", timestamp: new Date().toISOString() },
    { title: "Match demo available", detail: "Load sample data to preview the scoring flow.", page: "match", timestamp: new Date().toISOString() }
  ];

  feed.innerHTML = items.map(item => {
    const time = new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return `
      <div class="activity-item">
        <button type="button" onclick="navigateTo('${escapeHtml(item.page || "home")}')">
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.detail)}</p>
          <time>${escapeHtml(time)}</time>
        </button>
      </div>
    `;
  }).join("");
}

function dropZoneMarkup(icon, title, body) {
  return `<div class="drop-icon">${escapeHtml(icon)}</div><h3>${escapeHtml(title)}</h3><p>${escapeHtml(body)}</p><input type="file" id="file-input" accept=".pdf,.docx,.txt,.doc" hidden>`;
}

function useAnalysisInMatch() {
  const summary = window._lastAnalysisSummary || "";
  if (!summary) return toast("Run a resume analysis first.", "error");

  document.getElementById("match-resume").value = summary;
  navigateTo("match");
  toast("Resume summary moved into Match.", "success");
}

function getAnalysisBreakdown(data) {
  const skills = data.skills || {};
  const projects = data.projects || [];
  const breakdown = data.score_breakdown || {};

  return [
    { key: "skills_depth", label: "Skills Depth", score: breakdown.skills_depth ?? ((skills.technical || []).length * 12) },
    { key: "project_impact", label: "Project Impact", score: breakdown.project_impact ?? ((projects.length || 1) * 25) },
    { key: "experience_alignment", label: "Experience Fit", score: breakdown.experience_alignment ?? data.candidate_score },
    { key: "education_strength", label: "Education", score: breakdown.education_strength ?? data.education_quality },
    { key: "communication_signal", label: "Communication", score: breakdown.communication_signal ?? ((skills.soft || []).length * 15) },
    { key: "growth_signal", label: "Growth Signal", score: breakdown.growth_signal ?? data.candidate_score }
  ].map(item => ({ ...item, score: clampScore(item.score || 0) }));
}

function renderAnalysisKpis(data) {
  const container = document.getElementById("analyze-kpis");
  if (!container) return;

  const skills = data.skills || {};
  const technicalCount = (skills.technical || []).length;
  const softCount = (skills.soft || []).length;
  const toolCount = (skills.tools || []).length;
  const projects = data.projects || [];

  const breakdown = getAnalysisBreakdown(data);
  const getBreakdownScore = key => (breakdown.find(item => item.key === key) || {}).score || 0;

  const kpis = [
    { icon: "SC", label: "Candidate score", detail: "Overall role readiness", score: clampScore(data.candidate_score) },
    { icon: "SK", label: "Skill coverage", detail: `${technicalCount} technical, ${softCount} soft, ${toolCount} tools`, score: getBreakdownScore("skills_depth") },
    { icon: "PR", label: "Project signal", detail: `${projects.length || 0} project(s) detected`, score: getBreakdownScore("project_impact") },
    { icon: "GR", label: "Growth signal", detail: "Trajectory, ownership, and learning velocity", score: getBreakdownScore("growth_signal") }
  ];

  container.innerHTML = kpis.map(item => `
    <div class="kpi-item">
      <span class="kpi-icon">${escapeHtml(item.icon)}</span>
      <span><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(item.detail)}</small></span>
      <span class="kpi-score">${item.score}</span>
    </div>
  `).join("");
}

function drawResumeRadar(data) {
  const canvas = document.getElementById("resume-radar");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const center = { x: width / 2, y: height / 2 };
  const radius = 118;
  const values = getAnalysisBreakdown(data).map(item => ({
    label: item.label.replace("Experience Fit", "Experience").replace("Communication", "Comms"),
    value: item.score
  }));

  ctx.clearRect(0, 0, width, height);
  ctx.lineWidth = 1;
  ctx.font = "13px Manrope, sans-serif";

  for (let ring = 1; ring <= 4; ring += 1) {
    ctx.beginPath();
    values.forEach((_, index) => {
      const angle = (-Math.PI / 2) + (index * Math.PI * 2 / values.length);
      const pointRadius = radius * ring / 4;
      const x = center.x + Math.cos(angle) * pointRadius;
      const y = center.y + Math.sin(angle) * pointRadius;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.strokeStyle = "rgba(30,45,68,0.13)";
    ctx.stroke();
  }

  values.forEach((item, index) => {
    const angle = (-Math.PI / 2) + (index * Math.PI * 2 / values.length);
    const endX = center.x + Math.cos(angle) * radius;
    const endY = center.y + Math.sin(angle) * radius;
    ctx.beginPath();
    ctx.moveTo(center.x, center.y);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = "rgba(30,45,68,0.11)";
    ctx.stroke();

    const labelX = center.x + Math.cos(angle) * (radius + 28);
    const labelY = center.y + Math.sin(angle) * (radius + 28);
    ctx.fillStyle = "#4c5e73";
    ctx.textAlign = labelX < center.x - 10 ? "right" : labelX > center.x + 10 ? "left" : "center";
    ctx.fillText(item.label, labelX, labelY);
  });

  const gradient = ctx.createLinearGradient(55, 55, width - 55, height - 55);
  gradient.addColorStop(0, "rgba(46,231,200,0.72)");
  gradient.addColorStop(0.55, "rgba(108,99,255,0.56)");
  gradient.addColorStop(1, "rgba(255,184,77,0.62)");

  ctx.beginPath();
  values.forEach((item, index) => {
    const angle = (-Math.PI / 2) + (index * Math.PI * 2 / values.length);
    const pointRadius = radius * item.value / 100;
    const x = center.x + Math.cos(angle) * pointRadius;
    const y = center.y + Math.sin(angle) * pointRadius;
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();
  ctx.strokeStyle = "#6c63ff";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  values.forEach((item, index) => {
    const angle = (-Math.PI / 2) + (index * Math.PI * 2 / values.length);
    const pointRadius = radius * item.value / 100;
    const x = center.x + Math.cos(angle) * pointRadius;
    const y = center.y + Math.sin(angle) * pointRadius;
    ctx.beginPath();
    ctx.arc(x, y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = "#152033";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = "#2ee7c8";
    ctx.fill();
  });
}

function renderAnalysisDetails(data) {
  const breakdownContainer = document.getElementById("analyze-score-breakdown");
  const insightsContainer = document.getElementById("analyze-graph-insights");
  const notesContainer = document.getElementById("analyze-recruiter-notes");

  if (breakdownContainer) {
    breakdownContainer.innerHTML = getAnalysisBreakdown(data).map(item => `
      <div class="analysis-bar">
        <header><span>${escapeHtml(item.label)}</span><strong>${item.score}</strong></header>
        <div class="bar"><div class="fill" style="width:${item.score}%"></div></div>
      </div>
    `).join("");
  }

  if (insightsContainer) {
    const insights = (data.graph_insights || []).length
      ? data.graph_insights
      : [
          `Radar score peaks at ${clampScore(data.candidate_score)} for overall readiness.`,
          `${(data.projects || []).length || 0} project signal(s) found for deeper interview validation.`
        ];
    insightsContainer.innerHTML = renderList(insights);
  }

  if (notesContainer) {
    const notes = (data.recruiter_notes || []).length
      ? data.recruiter_notes
      : [
          "Validate the strongest technical evidence in interview.",
          "Compare project scope against the target role requirements."
        ];
    notesContainer.innerHTML = renderList(notes);
  }
}

async function handleResume(file) {
  const dropZone = document.getElementById("drop-zone");
  const progress = document.getElementById("upload-progress");
  const fill = document.getElementById("upload-fill");

  if (!dropZone || !progress || !fill) return;

  lastResumeFileName = file.name;
  progress.classList.remove("hidden");
  fill.style.width = "28%";
  dropZone.innerHTML = dropZoneMarkup("AI", file.name, "Parsing and scoring resume...");
  initResumeUpload();

  const form = new FormData();
  form.append("file", file);

  fill.style.width = "62%";
  try {
    const data = await apiCall("/api/analyze-resume", form, true);
    fill.style.width = "100%";
    setTimeout(() => renderAnalysis(data), 250);
  } catch (error) {
    fill.style.width = "0%";
    dropZone.innerHTML = dropZoneMarkup("RES", "Drop resume here", "Supports PDF, DOCX, TXT, and DOC files.");
    initResumeUpload();
  }
}

function renderAnalysis(data) {
  const result = document.getElementById("analyze-result");
  if (!result) return;

  result.classList.remove("hidden");
  animateScore("analyze-score-ring", "analyze-score-num", data.candidate_score || 0);
  document.getElementById("analyze-level").textContent = data.experience_level || "-";
  document.getElementById("analyze-trajectory").textContent = data.career_trajectory || "-";

  const skills = data.skills || {};
  document.getElementById("analyze-skills").innerHTML =
    renderTags(skills.technical, "tag-cyan") +
    renderTags(skills.soft, "tag-purple") +
    renderTags(skills.tools, "tag-pink");

  document.getElementById("analyze-domains").innerHTML = renderTags(data.domain_expertise, "tag-green");
  document.getElementById("analyze-strengths").innerHTML = renderList(data.strengths);
  document.getElementById("analyze-weaknesses").innerHTML = renderList(data.weaknesses);
  document.getElementById("analyze-summary").textContent = data.summary || "";
  document.getElementById("analyze-recs").innerHTML = renderList(data.recommendations);
  window._lastAnalysisSummary = [
    data.summary || "",
    `Experience: ${data.experience_level || "unknown"}`,
    `Skills: ${[
      ...((data.skills || {}).technical || []),
      ...((data.skills || {}).soft || []),
      ...((data.skills || {}).tools || [])
    ].join(", ")}`,
    `Strengths: ${(data.strengths || []).join(", ")}`,
    `Recommendations: ${(data.recommendations || []).join(", ")}`
  ].filter(Boolean).join("\n");
  renderAnalysisKpis(data);
  drawResumeRadar(data);
  renderAnalysisDetails(data);

  const dropZone = document.getElementById("drop-zone");
  if (dropZone) {
    dropZone.innerHTML = dropZoneMarkup("OK", lastResumeFileName || "Resume analyzed", "Drop another file to refresh the analysis.");
    initResumeUpload();
  }

  saveActivity("Resume analyzed", `Candidate score ${clampScore(data.candidate_score)} with ${data.experience_level || "unknown"} level signal.`, "analyze");
  toast("Resume analyzed successfully.", "success");
  result.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function runMatch() {
  const resume = document.getElementById("match-resume").value.trim();
  const job = document.getElementById("match-job").value.trim();
  if (!resume || !job) return toast("Please fill both fields.", "error");

  const restore = setButtonLoading(document.getElementById("match-btn"), "Analyzing");

  try {
    const data = await apiCall("/api/match", { resume_text: resume, job_description: job });
    renderMatch(data);
  } finally {
    restore();
  }
}

function renderMatch(data) {
  document.getElementById("match-result").classList.remove("hidden");
  animateScore("match-score-ring", "match-score-num", data.match_score || 0);
  document.getElementById("match-fit").textContent = data.overall_fit || "-";
  document.getElementById("match-verdict").textContent = data.hiring_suggestion || "-";

  const bars = [
    { skill: "Skills Match", match: data.skills_match || 0 },
    { skill: "Experience", match: data.experience_alignment || 0 },
    { skill: "Culture Fit", match: data.culture_fit || 0 },
    { skill: "Growth Potential", match: data.growth_potential || 0 }
  ];
  if (Array.isArray(data.skill_breakdown)) bars.push(...data.skill_breakdown.slice(0, 4));

  document.getElementById("match-bars").innerHTML = renderSkillBars(bars);
  document.getElementById("match-strengths").innerHTML = renderList(data.key_strengths);
  document.getElementById("match-gaps").innerHTML = renderList(data.skill_gaps);
  document.getElementById("match-explanation").textContent = data.explanation || "";
  document.getElementById("match-recs").innerHTML = renderList(data.recommendations);

  saveActivity("Match completed", `${clampScore(data.match_score)}% fit with ${humanize(data.hiring_suggestion || "pending")} verdict.`, "match");
  toast("Match analysis complete.", "success");
  document.getElementById("match-result").scrollIntoView({ behavior: "smooth", block: "start" });
}

let interviewHistory = [];
let interviewActive = false;

function startInterview() {
  interviewHistory = [];
  interviewActive = true;
  document.getElementById("chat-messages").innerHTML = "";
  document.getElementById("chat-input").disabled = false;
  document.getElementById("chat-send-btn").disabled = false;
  document.getElementById("start-interview-btn").classList.add("hidden");
  document.getElementById("end-interview-btn").classList.remove("hidden");
  document.getElementById("interview-status").textContent = "Active";
  sendInterviewMessage("Hello, I am ready for the interview. Please start.");
}

function endInterview() {
  if (!interviewActive) return;
  sendInterviewMessage("I would like to end the interview now. Please give me a final assessment.");
}

async function sendMessage() {
  const input = document.getElementById("chat-input");
  const message = input.value.trim();
  if (!message || !interviewActive) return;

  input.value = "";
  sendInterviewMessage(message);
}

async function sendInterviewMessage(message) {
  const messages = document.getElementById("chat-messages");
  const loaderId = `loader-${Date.now()}`;

  messages.insertAdjacentHTML("beforeend", `<div class="msg user">${escapeHtml(message)}</div>`);
  messages.insertAdjacentHTML("beforeend", `<div class="msg ai" id="${loaderId}">${loaderMarkup("Thinking")}</div>`);
  messages.scrollTop = messages.scrollHeight;
  interviewHistory.push({ role: "user", content: message });

  try {
    const data = await apiCall("/api/interview", {
      message,
      role: document.getElementById("interview-role").value,
      history: interviewHistory,
      difficulty: document.getElementById("interview-difficulty").value
    });

    const loader = document.getElementById(loaderId);
    if (loader) {
      const feedback = data.feedback
        ? `<br><br><em class="accent-note">Feedback: ${escapeHtml(data.feedback)}</em>`
        : "";
      const score = data.score !== null && data.score !== undefined
        ? `<br><span class="tag tag-cyan">Score: ${clampScore(data.score)}/100</span>`
        : "";
      loader.innerHTML = `${formatText(data.response || "No response returned.")}${feedback}${score}`;
    }

    interviewHistory.push({ role: "assistant", content: data.response || "" });

    if (data.interview_complete) {
      completeInterview(data);
    }
  } catch (error) {
    const loader = document.getElementById(loaderId);
    if (loader) loader.innerHTML = "Failed to get a response. Please try again.";
  }

  messages.scrollTop = messages.scrollHeight;
}

function completeInterview(data) {
  interviewActive = false;
  document.getElementById("chat-input").disabled = true;
  document.getElementById("chat-send-btn").disabled = true;
  document.getElementById("start-interview-btn").classList.remove("hidden");
  document.getElementById("end-interview-btn").classList.add("hidden");
  document.getElementById("interview-status").textContent = "Complete";

  if (data.final_score !== undefined && data.final_score !== null) {
    document.getElementById("interview-result").classList.remove("hidden");
    animateScore("interview-score-ring", "interview-score-num", data.final_score || 0);

    const metrics = data.metrics || {};
    const metricBars = Object.keys(metrics)
      .filter(key => metrics[key] !== null && metrics[key] !== undefined)
      .map(key => ({ skill: humanize(key), match: metrics[key] }));

    document.getElementById("interview-metrics").innerHTML = renderSkillBars(metricBars);
    document.getElementById("interview-weaknesses").innerHTML = renderList(data.weaknesses);
    document.getElementById("interview-plan").innerHTML = renderList(data.improvement_plan);

    saveActivity("Interview completed", `Final score ${clampScore(data.final_score)} with coaching plan generated.`, "interview");
    document.getElementById("interview-result").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  toast("Interview complete.", "success");
}

async function runBias() {
  const jobDescription = document.getElementById("bias-input").value.trim();
  if (!jobDescription) return toast("Please enter a job description.", "error");

  const restore = setButtonLoading(document.getElementById("bias-btn"), "Reviewing");

  try {
    const data = await apiCall("/api/detect-bias", { job_description: jobDescription });
    renderBias(data, jobDescription);
  } finally {
    restore();
  }
}

function renderBias(data, original) {
  document.getElementById("bias-result").classList.remove("hidden");
  animateScore("bias-score-ring", "bias-score-num", data.bias_score || 0);
  document.getElementById("bias-level").textContent = data.bias_level || "-";

  const issues = (data.issues || []).map(issue => `
    <div class="list-row">
      <strong>${escapeHtml(humanize(issue.type || "Issue"))} - ${escapeHtml(issue.severity || "medium")}</strong>
      <div><span class="highlight-red">${escapeHtml(issue.original_text || "")}</span></div>
      <div>${escapeHtml(issue.suggestion || issue.explanation || "")}</div>
    </div>
  `).join("");

  document.getElementById("bias-issues").innerHTML = issues || `<div class="list-row">No issues found.</div>`;

  let highlighted = escapeHtml(original);
  (data.issues || []).forEach(issue => {
    const escaped = escapeHtml(issue.original_text || "");
    if (escaped) highlighted = highlighted.split(escaped).join(`<span class="highlight-red">${escaped}</span>`);
  });

  document.getElementById("bias-original-text").innerHTML = highlighted;
  document.getElementById("bias-fixed-text").innerHTML = formatText(data.improved_description || "");
  document.getElementById("bias-summary").textContent = data.summary || "";

  saveActivity("Bias review completed", `${humanize(data.bias_level || "unknown")} bias level with ${(data.issues || []).length} issue(s) found.`, "bias");
  toast("Bias analysis complete.", "success");
  document.getElementById("bias-result").scrollIntoView({ behavior: "smooth", block: "start" });
}

async function runCoach() {
  const skills = document.getElementById("coach-skills").value.trim();
  const role = document.getElementById("coach-role").value.trim();
  if (!skills || !role) return toast("Please fill in your skills and target role.", "error");

  const restore = setButtonLoading(document.getElementById("coach-btn"), "Building");

  try {
    const data = await apiCall("/api/career-coach", {
      current_skills: skills,
      target_role: role,
      experience_level: document.getElementById("coach-level").value
    });
    renderCoach(data);
  } finally {
    restore();
  }
}

function renderCoach(data) {
  document.getElementById("coach-result").classList.remove("hidden");
  animateScore("coach-score-ring", "coach-score-num", data.readiness_score || 0);
  document.getElementById("coach-timeline").textContent = data.timeline || "-";

  document.getElementById("coach-gaps").innerHTML = renderSkillBars(
    (data.gap_analysis || []).map(gap => ({
      skill: `${gap.skill || "Skill"} (${gap.priority || "priority"})`,
      match: gap.current
    }))
  );

  document.getElementById("coach-roadmap").innerHTML = (data.learning_roadmap || []).map(phase => `
    <div class="roadmap-item">
      <h4>Phase ${escapeHtml(phase.phase || "")}: ${escapeHtml(phase.title || "")} <span class="tag tag-purple">${escapeHtml(phase.duration || "")}</span></h4>
      <p>${escapeHtml((phase.tasks || []).join(" -> "))}</p>
    </div>
  `).join("");

  document.getElementById("coach-courses").innerHTML = (data.recommended_courses || []).map(course => `
    <div class="course-row">
      <strong>${escapeHtml(course.name || "")}</strong> <span class="tag tag-purple">${escapeHtml(course.platform || "")}</span>
      <div>${escapeHtml(course.relevance || "")}</div>
    </div>
  `).join("");

  document.getElementById("coach-projects").innerHTML = (data.project_ideas || []).map(project => `
    <div class="project-row">
      <strong>${escapeHtml(project.title || "")}</strong>
      <div>${escapeHtml(project.description || "")}</div>
      <div class="tag-cloud">${renderTags(project.skills_practiced, "tag-cyan")}</div>
    </div>
  `).join("");

  document.getElementById("coach-motivation").textContent = data.motivation || "";

  saveActivity("Career roadmap generated", `${clampScore(data.readiness_score)}% readiness with timeline ${data.timeline || "pending"}.`, "coach");
  toast("Career roadmap generated.", "success");
  document.getElementById("coach-result").scrollIntoView({ behavior: "smooth", block: "start" });
}

async function runOutreach() {
  const name = document.getElementById("out-name").value.trim();
  const skills = document.getElementById("out-skills").value.trim();
  const role = document.getElementById("out-role").value.trim();
  if (!name || !skills || !role) return toast("Please fill in candidate name, skills, and role.", "error");

  const restore = setButtonLoading(document.getElementById("outreach-btn"), "Writing");

  try {
    const data = await apiCall("/api/generate-outreach", {
      candidate_name: name,
      candidate_skills: skills,
      target_role: role,
      company_name: document.getElementById("out-company").value || "Our Company",
      tone: document.getElementById("out-tone").value
    });
    renderOutreach(data);
  } finally {
    restore();
  }
}

function renderOutreach(data) {
  document.getElementById("outreach-result").classList.remove("hidden");
  document.getElementById("out-subject").textContent = data.subject_line || "";
  document.getElementById("out-message").textContent = data.message || "";
  document.getElementById("out-linkedin").textContent = data.linkedin_version || "";
  document.getElementById("out-followup").textContent = data.follow_up || "";

  saveActivity("Outreach generated", `Personalization score ${clampScore(data.personalization_score)} with ${data.subject_line || "subject ready"}.`, "outreach");
  toast("Outreach message generated.", "success");
  document.getElementById("outreach-result").scrollIntoView({ behavior: "smooth", block: "start" });
}
