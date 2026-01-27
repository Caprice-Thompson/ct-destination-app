import React from "react";
import { RouterProvider } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import { getRouter } from "./routes";

export function AppWrapper() {
  return (
    <React.StrictMode>
      <RouterProvider router={getRouter()} />
    </React.StrictMode>
  );
}

const rootElement = document.getElementById("root") as HTMLElement;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<AppWrapper />);
}