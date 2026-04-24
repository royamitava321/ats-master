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
  try {
    const buffer = fs.readFileSync(filePath);
    const data = await pdf(buffer);
    return (data.text || "").slice(0, 6000);
  } catch {
    return "Resume parsing failed";
  }
}

/* =========================
   ATS ANALYSIS
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
Return JSON:
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
}`
        },
        {
          role: "user",
          content: `JOB:\n${jobDesc}\n\nRESUME:\n${resumeText}`
        }
      ]
    });

    const result = JSON.parse(response.choices[0].message.content);
    fs.unlinkSync(req.file.path);
    res.json(result);

  } catch (err) {
    console.error("ATS ERROR:", err);
    res.status(500).json({ error: "ATS failed" });
  }
});

/* =========================
   ROLE DETECTION
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
          content: `Return JSON: { "role": "", "skills": [] }`
        },
        {
          role: "user",
          content: resumeText
        }
      ]
    });

    const result = JSON.parse(response.choices[0].message.content);
    fs.unlinkSync(req.file.path);
    res.json(result);

  } catch (err) {
    console.error("ROLE ERROR:", err);
    res.status(500).json({ error: "Role failed" });
  }
});

/* =========================
   JOB SEARCH (DEBUG VERSION)
========================= */
app.get("/api/jobs", async (req, res) => {
  try {
    const { role } = req.query;

    const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(role || "developer")}&page=1&num_pages=1`;

    const response = await fetch(url, {
      headers: {
        "X-RapidAPI-Key": process.env.RAPID_API_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
      }
    });

    const data = await response.json();

    console.log("🔍 RAW API RESPONSE:", JSON.stringify(data, null, 2));

    let jobs = data.data || [];

    jobs = jobs.slice(0, 10).map(job => ({
      title: job.job_title,
      company: job.employer_name,
      location: job.job_city || job.job_country || "Remote",
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
