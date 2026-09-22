// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import HostLogin from "./pages/HostLogin";
import HostSelectEvent from "./pages/HostSelectEvent";
import Host    from "./pages/Host";
import Join    from "./pages/Join";
import Results from "./pages/Results";

import LiveResults from "./pages/LiveResults";
import QRPage      from "./pages/QRPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                  element={<Landing />} />
        <Route path="/host-login"        element={<HostLogin />} />
        <Route path="/select-event"      element={<HostSelectEvent />} />
        <Route path="/host"              element={<Host />} />
        <Route path="/join/:gameId"      element={<Join />} />
        <Route path="/results/:gameId"   element={<Results />} />
        <Route path="/live_results/:gameId" element={<LiveResults />} />
        <Route path="/qr/:gameId"        element={<QRPage />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
