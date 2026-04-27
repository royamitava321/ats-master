import React, { useState } from "react";

function ATS() {
  const [jd, setJd] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        "https://ats-master-production.up.railway.app/api/analyze",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobDescription: jd }),
        }
      );

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div>
      <h1>ATS Analysis</h1>

      <textarea
        placeholder="Paste Job Description..."
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        style={{ width: "100%", height: "150px" }}
      />

      <button onClick={analyze}>Analyze</button>

      {loading && <p>Analyzing...</p>}

      {result && (
        <div>
          <h3>Score: {result.score}</h3>
          <p>{result.feedback}</p>
        </div>
      )}
    </div>
  );
}

export default ATS;
