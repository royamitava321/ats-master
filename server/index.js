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

/* =========================
   FILE UPLOAD
========================= */
const upload = multer({ dest: "uploads/" });

/* =========================
   OPENAI
========================= */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* =========================
   PDF TEXT EXTRACT
========================= */
async function extractText(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const data = await pdf(buffer);
    return (data.text || "").slice(0, 6000);
  } catch {
    return "";
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
    res.status(500).json({ error: "Role detection failed" });
  }
});

/* =========================
   JOB SEARCH (REAL FIX)
========================= */
app.get("/api/jobs", async (req, res) => {
  try {
    const { role } = req.query;

    // 🔥 Use EXACT working pattern from RapidAPI test
    const query = `${role || "developer"} jobs in chicago`;

    const response = await fetch(
      `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=1&num_pages=1`,
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPID_API_KEY,
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
        }
      }
    );

    const data = await response.json();

    console.log("RAW DATA:", JSON.stringify(data, null, 2));

    // 🔥 CRITICAL FIX
    if (!data || !data.data || !Array.isArray(data.data)) {
      return res.json({ jobs: [] });
    }

    const jobs = data.data.map(job => ({
      title: job.job_title,
      company: job.employer_name,
      location: job.job_location || job.job_city || job.job_country,
      url: job.job_apply_link
    }));

    res.json({ jobs });

  } catch (err) {
    console.error("JOB ERROR:", err);
    res.status(500).json({ error: "Job fetch failed" });
  }
});

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.send("ATS MASTER API RUNNING");
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`SERVER RUNNING on ${PORT}`);
});
