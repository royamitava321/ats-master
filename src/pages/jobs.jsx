import React, { useEffect, useState } from "react";

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://ats-master-production.up.railway.app/api/jobs?role=developer&country=india")
      .then((res) => res.json())
      .then((data) => {
        setJobs(data.jobs || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1>Job Matches</h1>

      {loading && <p>Loading jobs...</p>}

      {!loading && jobs.length === 0 && <p>No jobs found</p>}

      {jobs.map((job, index) => (
        <div key={index} style={{ marginBottom: "20px" }}>
          <h3>{job.title}</h3>
          <p>{job.company}</p>
          <p>{job.location}</p>
          <a href={job.url} target="_blank" rel="noreferrer">
            Apply Now
          </a>
        </div>
      ))}
    </div>
  );
}

export default Jobs;
