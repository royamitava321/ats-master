import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import ATS from "./pages/ats";     // ✅ lower case
import Jobs from "./pages/jobs";   // ✅ lower case

function App() {
  return (
    <Router>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        
        <div style={{
          width: "240px",
          background: "#1e293b",
          color: "white",
          position: "fixed",
          height: "100vh"
        }}>
          {/* Sidebar */}
        </div>

        <div style={{
          marginLeft: "240px",
          width: "100%",
          padding: "20px"
        }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/ats" element={<ATS />} />
            <Route path="/jobs" element={<Jobs />} />
          </Routes>
        </div>

      </div>
    </Router>
  );
}

export default App;
