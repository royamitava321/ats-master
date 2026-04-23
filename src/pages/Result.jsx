import React, { useEffect, useState } from "react";

const Result = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("ats_result");
    if (stored) {
      setData(JSON.parse(stored));
    }
  }, []);

  if (!data) {
    return <h2 className="text-white text-center mt-10">No data found</h2>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">

      <h1 className="text-3xl font-bold text-purple-400 mb-6">
        ATS Analysis Report
      </h1>

      {/* TOP CARDS */}
      <div className="grid grid-cols-3 gap-6 mb-6">

        <div className="bg-slate-800 p-6 rounded-xl">
          <h2 className="text-gray-400">ATS Score</h2>
          <p className="text-3xl font-bold text-purple-400">
            {data.score}
          </p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl">
          <h2 className="text-gray-400">Job Match</h2>
          <p className="text-3xl font-bold">
            {data.matchPercent}%
          </p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl">
          <h2 className="text-gray-400">Domain</h2>
          <p className="text-xl">{data.domain}</p>
        </div>

      </div>

      {/* DECISION */}
      <div className="bg-slate-800 p-4 rounded-xl mb-6">
        <h2 className="text-gray-400">Recruiter Decision</h2>
        <p className="text-lg font-semibold">{data.recruiterDecision}</p>
      </div>

      {/* STRENGTHS */}
      <div className="bg-slate-800 p-4 rounded-xl mb-6">
        <h2 className="text-green-400 mb-2">Strengths</h2>
        {data.strengths.map((item, i) => (
          <p key={i}>✔ {item}</p>
        ))}
      </div>

      {/* IMPROVEMENTS */}
      <div className="bg-slate-800 p-4 rounded-xl mb-6">
        <h2 className="text-yellow-400 mb-2">Improvements</h2>
        {data.improvements.map((item, i) => (
          <p key={i}>⚠ {item}</p>
        ))}
      </div>

      {/* KEYWORDS */}
      <div className="grid grid-cols-2 gap-6">

        <div className="bg-slate-800 p-4 rounded-xl">
          <h2 className="text-green-400 mb-2">Matched Keywords</h2>
          {data.matchedKeywords.map((item, i) => (
            <p key={i}>{item}</p>
          ))}
        </div>

        <div className="bg-slate-800 p-4 rounded-xl">
          <h2 className="text-red-400 mb-2">Missing Keywords</h2>
          {data.missingKeywords.map((item, i) => (
            <p key={i}>{item}</p>
          ))}
        </div>

      </div>

    </div>
  );
};

export default Result;