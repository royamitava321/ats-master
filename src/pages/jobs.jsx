import React, { useEffect, useState } from "react";

function Jobs() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetch("https://ats-master-production.up.railway.app/api/jobs?role=developer&country=usa")
      .then((res) => res.json())
      .then((data) => setJobs(data.jobs || []))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>Job Matches</h1>
      {jobs.map((job, index) => (
        <div key={index}>
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
