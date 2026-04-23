import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Upload = () => {
  const [file, setFile] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) {
      alert("Please upload a resume");
      return;
    }

    console.log("🚀 Upload started"); // DEBUG

    setLoading(true);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDesc);

    try {
      const response = await fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        body: formData,
      });

      console.log("📡 API CALLED"); // DEBUG

      const data = await response.json();

      console.log("✅ RESPONSE:", data); // DEBUG

      localStorage.setItem("ats_result", JSON.stringify(data));

      navigate("/result");

    } catch (error) {
      console.error("❌ ERROR:", error);
      alert("Failed to analyze resume");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      <h1 className="text-3xl font-bold text-center text-purple-400">
        ATS Resume Analyzer
      </h1>

      {/* JOB DESCRIPTION */}
      <textarea
        placeholder="Paste Job Description..."
        value={jobDesc}
        onChange={(e) => setJobDesc(e.target.value)}
        className="w-full p-4 rounded-xl bg-slate-800 text-white"
        rows={6}
      />

      {/* FILE UPLOAD */}
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => {
          setFile(e.target.files[0]);
          console.log("📄 File selected:", e.target.files[0]); // DEBUG
        }}
        className="w-full p-4 border border-white/20 rounded-xl"
      />

      {/* BUTTON */}
      <button
        onClick={handleUpload}
        className="w-full py-3 bg-purple-600 rounded-xl text-white font-bold"
      >
        {loading ? "Analyzing..." : "Start Analysis"}
      </button>

    </div>
  );
};

export default Upload;