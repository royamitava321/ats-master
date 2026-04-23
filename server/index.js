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
}

Rules:
- score between 60–85
- recruiterDecision:
  Select >= 70
  Hold 55–69
  Reject < 55
- NEVER return empty arrays
`
                },
                {
                    role: "user",
                    content: `JOB DESCRIPTION:\n${jobDesc}\n\nRESUME:\n${resumeText}`
                }
            ]
        });

        let result = JSON.parse(response.choices[0].message.content);

        if (!result.strengths?.length) result.strengths = ["Relevant experience present"];
        if (!result.improvements?.length) result.improvements = ["Add more role-specific keywords"];
        if (!result.matchedKeywords?.length) result.matchedKeywords = ["communication", "analysis"];
        if (!result.missingKeywords?.length) result.missingKeywords = ["advanced tools", "domain skills"];

        fs.unlinkSync(req.file.path);
        res.json(result);

    } catch (err) {
        console.error("ATS ERROR:", err);
        res.status(500).json({ error: "Analysis failed" });
    }
});

/* =========================
   DETECT ROLE
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
- Role can be ANY profession
- Skills must be 7–15 keywords
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
        if (!result.skills?.length)
            result.skills = ["communication", "analysis", "problem solving"];

        fs.unlinkSync(req.file.path);
        res.json(result);

    } catch (err) {
        console.error("ROLE ERROR:", err);
        res.status(500).json({ error: "Role detection failed" });
    }
});

/* =========================
   JOB SEARCH (SMART FIX)
========================= */
app.get("/api/jobs", async (req, res) => {
    try {
        const { role, country } = req.query;

        const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(role)}&page=1&num_pages=1`;

        const response = await fetch(url, {
            headers: {
                "X-RapidAPI-Key": process.env.RAPID_API_KEY,
                "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
            }
        });

        const data = await response.json();

        let jobs = data.data || [];

        // ✅ TRY FILTER
        let filtered = jobs.filter(job => {
            const loc = `${job.job_country || ""}`.toLowerCase();

            if (country === "in") return loc.includes("in");
            if (country === "us") return loc.includes("us");
            if (country === "uk") return loc.includes("gb");
            if (country === "ca") return loc.includes("ca");
            if (country === "au") return loc.includes("au");

            return false;
        });

        // ✅ FALLBACK (IMPORTANT)
        if (filtered.length === 0) {
            filtered = jobs; // show global instead of empty
        }

        const formatted = filtered.slice(0, 10).map(job => ({
            title: job.job_title,
            company: job.employer_name,
            location: `${job.job_city || ""}, ${job.job_country || ""}`,
            url: job.job_apply_link
        }));

        res.json({ jobs: formatted });

    } catch (err) {
        console.error("JOB ERROR:", err);
        res.status(500).json({ error: "Job fetch failed" });
    }
});

app.listen(5000, () => {
    console.log("SERVER RUNNING http://localhost:5000");
});