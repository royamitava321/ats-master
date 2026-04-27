import React, { useState } from "react";

function Jobs() {
  const [role, setRole] = useState("developer");
  const [country, setCountry] = useState("india");
  const [jobs, setJobs] = useState([]);

  const searchJobs = async () => {
    const res = await fetch(
      `https://ats-master-production.up.railway.app/api/jobs?role=${role}&country=${country}`
    );
    const data = await res.json();
    setJobs(data.jobs || []);
  };

  return (
    <div>
      <h1>Job Search</h1>

      <input
        placeholder="Role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      />

      <select
        value={country}
        onChange={(e) => setCountry(e.target.value)}
      >
        <option value="india">India</option>
        <option value="usa">USA</option>
      </select>

      <button onClick={searchJobs}>Search</button>

      {jobs.map((job, i) => (
        <div key={i}>
          <h3>{job.title}</h3>
          <p>{job.company}</p>
          <p>{job.location}</p>
          <a href={job.url} target="_blank">Apply</a>
        </div>
      ))}
    </div>
  );
}

export default Jobs;
