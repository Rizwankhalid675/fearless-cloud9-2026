import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DraftBoard } from "./ui/DraftBoard";
import "./ui/app.css";

const root = document.getElementById("root");
if (!root) throw new Error("No #root in the document.");

createRoot(root).render(
  <StrictMode>
    <DraftBoard />
  </StrictMode>,
);
