import React, { useState } from "react";

export default function Recommendations() {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState("");
  const [skills, setSkills] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [country, setCountry] = useState("in");

  const detectRole = async () => {
    if (!file) {
      alert("Upload CV first");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    const res = await fetch("http://localhost:5000/api/detect-role", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    setRole(data.role);
    setSkills(data.skills);
  };

  const searchJobs = async () => {
    if (!role) {
      alert("Detect role first");
      return;
    }

    const res = await fetch(
      `http://localhost:5000/api/jobs?role=${encodeURIComponent(role)}&country=${country}`
    );

    const data = await res.json();

    setJobs(data.jobs || []);
  };

  return (
    <div style={{ padding: 30, color: "white" }}>
      <h2>CV Based Job Recommendations</h2>

      {/* Upload */}
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        style={{
          background: "#1e293b",
          color: "white",
          padding: 10,
          marginBottom: 15
        }}
      />

      <br />

      {/* Detect */}
      <button
        onClick={detectRole}
        style={{
          background: "purple",
          color: "white",
          padding: "10px 20px",
          marginBottom: 20
        }}
      >
        Detect Role
      </button>

      {/* Role */}
      {role && (
        <div style={{ marginBottom: 20 }}>
          <b>Role:</b> {role}
          <br />
          <b>Skills:</b> {skills.join(", ")}
        </div>
      )}

      {/* Country */}
      <select
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        style={{
          background: "#1e293b",
          color: "white",
          padding: 10,
          marginRight: 10
        }}
      >
        <option value="in">India</option>
        <option value="us">USA</option>
        <option value="uk">UK</option>
        <option value="ca">Canada</option>
        <option value="au">Australia</option>
      </select>

      <button
        onClick={searchJobs}
        style={{
          background: "green",
          color: "white",
          padding: "10px 20px"
        }}
      >
        Search Jobs
      </button>

      {/* Jobs */}
      <div style={{ marginTop: 20 }}>
        {jobs.length === 0 && <p>No jobs found</p>}

        {jobs.map((job, i) => (
          <div
            key={i}
            style={{
              border: "1px solid gray",
              padding: 15,
              marginBottom: 10
            }}
          >
            <h4>{job.title}</h4>
            <p>{job.company}</p>
            <p>{job.location}</p>

            <a href={job.url} target="_blank">
              <button style={{ background: "purple", color: "white" }}>
                Apply
              </button>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}