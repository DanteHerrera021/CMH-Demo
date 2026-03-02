import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// import Shell from "../components/layout/Shell";
import Home from "../pages/Home";
// import Library from "../pages/Library";
// import Upload from "../pages/Upload";
// import NotFound from "../pages/NotFound";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Redirect root to the main page you want for the demo */}
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* Pages that share the same app layout */}
      {/* <Route element={<Shell />}> */}
      <Route path="/home" element={<Home />} />
      {/* <Route path="/library" element={<Library />} /> */}
      {/* <Route path="/upload" element={<Upload />} /> */}
      {/* </Route> */}

      {/* Catch-all */}
      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
  );
}
