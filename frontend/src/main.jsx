import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { registerServiceWorker } from "./lib/notificationUtils.js";

const rootElement = document.getElementById("root");

if (rootElement) {
	createRoot(rootElement).render(<App />);
	
	// Register service worker for push notifications
	if ('serviceWorker' in navigator) {
		registerServiceWorker().catch(err => console.log('SW registration failed:', err));
	}
}
