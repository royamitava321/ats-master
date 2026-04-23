import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Welcome back! Here's your ATS overview
          </p>
        </div>

        <button
          onClick={() => navigate("/upload")}
          className="bg-purple-600 hover:bg-purple-500 px-5 py-2 rounded-lg text-white font-medium shadow-lg"
        >
          + New Analysis
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-slate-800 p-6 rounded-xl shadow-md">
          <p className="text-gray-400 text-sm">Total Resumes</p>
          <h2 className="text-2xl font-bold mt-2">12</h2>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl shadow-md">
          <p className="text-gray-400 text-sm">Avg ATS Score</p>
          <h2 className="text-2xl font-bold mt-2">74%</h2>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl shadow-md">
          <p className="text-gray-400 text-sm">Job Matches</p>
          <h2 className="text-2xl font-bold mt-2">158</h2>
        </div>

      </div>

      {/* Recent Activity */}
      <div className="bg-slate-800 p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>

        <div className="space-y-4">
          <div className="flex justify-between border-b border-slate-700 pb-2">
            <span>Senior Frontend Engineer</span>
            <span className="text-green-400">Completed</span>
          </div>

          <div className="flex justify-between border-b border-slate-700 pb-2">
            <span>Product Manager</span>
            <span className="text-yellow-400">Needs Improvement</span>
          </div>

          <div className="flex justify-between">
            <span>Data Scientist</span>
            <span className="text-green-400">Completed</span>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-slate-800 p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold mb-2">Tips for You</h3>
        <p className="text-gray-400">
          Add measurable achievements to increase your ATS score by up to 15%.
        </p>
      </div>

    </div>
  );
};

export default Dashboard;