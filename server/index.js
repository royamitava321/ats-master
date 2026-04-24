import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import multer from "multer";
import fs from "fs";
import pdf from "pdf-parse";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* =========================
   PDF TEXT EXTRACTION
========================= */
async function extractText(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdf(buffer);

  let text = data.text || "";

  if (!text || text.length < 50) {
    return "Basic resume content";
  }

  return text.slice(0, 6000);
}

/* =========================
   ATS ANALYSIS (CV + JD)
========================= */
app.post("/api/analyze", upload.single("resume"), async (req, res) => {
  try {
    const jobDesc = req.body.jobDescription || "";
    const resumeText = await extractText(req.file.path);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
You are an ATS system.

Return STRICT JSON:

{
  "score": number,
  "matchPercent": number,
  "domain": "",
  "summary": "",
  "strengths": [],
  "improvements": [],
  "matchedKeywords": [],
  "missingKeywords": [],
  "recruiterDecision": ""
}

Rules:
- score must be between 60–85
- recruiterDecision:
   Select >= 70
   Hold 55–69
   Reject < 55
- NEVER leave arrays empty
`
        },
        {
          role: "user",
          content: `JOB DESCRIPTION:\n${jobDesc}\n\nRESUME:\n${resumeText}`
        }
      ]
    });

    let result = JSON.parse(response.choices[0].message.content);

    // fallback safety
    if (!result.strengths?.length) result.strengths = ["Relevant experience"];
    if (!result.improvements?.length) result.improvements = ["Add more keywords"];
    if (!result.matchedKeywords?.length) result.matchedKeywords = ["analysis"];
    if (!result.missingKeywords?.length) result.missingKeywords = ["tools"];

    fs.unlinkSync(req.file.path);

    res.json(result);

  } catch (err) {
    console.error("ATS ERROR:", err);
    res.status(500).json({ error: "Analysis failed" });
  }
});

/* =========================
   ROLE + SKILLS
========================= */
app.post("/api/detect-role", upload.single("resume"), async (req, res) => {
  try {
    const resumeText = await extractText(req.file.path);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
Return JSON:

{
  "role": "",
  "skills": []
}

Rules:
- Role must be generic
- Skills: 7–15 keywords
`
        },
        {
          role: "user",
          content: resumeText
        }
      ]
    });

    let result = JSON.parse(response.choices[0].message.content);

    if (!result.role) result.role = "Professional";
    if (!result.skills?.length) result.skills = ["analysis", "communication"];

    fs.unlinkSync(req.file.path);

    res.json(result);

  } catch (err) {
    console.error("ROLE ERROR:", err);
    res.status(500).json({ error: "Role detection failed" });
  }
});

/* =========================
   JOB SEARCH (FIXED)
========================= */
app.get("/api/jobs", async (req, res) => {
  try {
    const { role, country, skills } = req.query;

    // ✅ FIX COUNTRY
    const countryMap = {
      india: "in",
      usa: "us",
      uk: "gb",
      canada: "ca",
      australia: "au"
    };

    const apiCountry = countryMap[country?.toLowerCase()] || "us";

    const query = `${role} ${skills || ""}`;

    const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&num_pages=1&country=${apiCountry}`;

    const response = await fetch(url, {
      headers: {
        "X-RapidAPI-Key": process.env.RAPID_API_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
      }
    });

    const data = await response.json();

    let jobs = data.data || [];

    jobs = jobs.slice(0, 10).map(job => ({
      title: job.job_title,
      company: job.employer_name,
      location: job.job_country || job.job_city || "Remote",
      url: job.job_apply_link
    }));

    res.json({ jobs });

  } catch (err) {
    console.error("JOB ERROR:", err);
    res.status(500).json({ error: "Job fetch failed" });
  }
});

/* ========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`SERVER RUNNING on port ${PORT}`);
});
