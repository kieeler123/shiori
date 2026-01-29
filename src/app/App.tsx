import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LogsPage from "../pages/LogsPage";
import LogDetailPage from "../pages/LogDetailPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/logs" replace />} />
        <Route path="/logs" element={<LogsPage />} />
        <Route path="/logs/:id" element={<LogDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}
