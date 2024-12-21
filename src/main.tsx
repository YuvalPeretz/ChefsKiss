import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Route, Routes } from "react-router";
import { Spin } from "antd";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route path="shrek" element={<Spin tip="טוען הרשאות" fullscreen />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
