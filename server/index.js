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

/* =========================
   OPENAI SETUP
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
   ATS ANALYSIS (FINAL)
========================= */
app.post("/api/analyze", upload.single("resume"), async (req, res) => {
  try {
    const jobDesc = req.body.jobDescription || "";
    const resumeText = await extractText(req.file.path);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
You are an ATS system.

Return ONLY JSON:

{
  "score": number,
  "matchPercent": number,
  "summary": "",
  "strengths": [],
  "missingSkills": [],
  "improvements": []
}

Be strict like a real recruiter.
`
        },
        {
          role: "user",
          content: `
JOB DESCRIPTION:
${jobDesc}

RESUME:
${resumeText}
`
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
   JOB SEARCH (FINAL FIXED)
========================= */
app.get("/api/jobs", async (req, res) => {
  try {
    const { role, country } = req.query;

    const query = `${role || "developer"} jobs`;

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

    if (!data?.data) return res.json({ jobs: [] });

    let jobs = data.data;

    // 🌍 FILTER + FALLBACK
    if (country) {
      const c = country.toLowerCase();

      let filtered = jobs.filter(job => {
        const code = (job.job_country || "").toLowerCase();

        if (c === "india") return code === "in";
        if (c === "usa") return code === "us";
        if (c === "uk") return code === "gb";
        if (c === "canada") return code === "ca";

        return true;
      });

      if (filtered.length > 0) {
        jobs = filtered;
      }
    }

    // remove duplicate cities
    const seen = new Set();
    const finalJobs = [];

    for (let job of jobs) {
      const city = job.job_city || "unknown";

      if (!seen.has(city)) {
        seen.add(city);

        finalJobs.push({
          title: job.job_title,
          company: job.employer_name,
          location: city,
          url: job.job_apply_link
        });
      }

      if (finalJobs.length === 10) break;
    }

    res.json({ jobs: finalJobs });

  } catch (err) {
    console.error("JOB ERROR:", err);
    res.status(500).json({ error: "Job fetch failed" });
  }
});

/* =========================
   ROOT
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
