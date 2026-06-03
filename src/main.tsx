import ReactDOM from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { App } from "./app/App";
import "./i18n";
import "./styles/index.css";
import "leaflet/dist/leaflet.css";
import { isNativePlatform } from "./shared/mobile/capacitor";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Analytics />
    <SpeedInsights />
  </>
);

if (
  import.meta.env.PROD &&
  !isNativePlatform() &&
  "serviceWorker" in navigator
) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/service-worker.js");
  });
}
