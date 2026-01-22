// Temporary file to help restore Settings.jsx
// Remove these lines from Settings.jsx:

// Lines 69-70 (state):
// const [accentColor, setAccentColor] = useState('blue');
// const [defaultView, setDefaultView] = useState('dashboard');

// Lines 72-78 (load stored):
// useEffect(() => {
//   const storedAccent = localStorage.getItem("accentColor");
//   if (storedAccent) setAccentColor(storedAccent);
//   const storedView = localStorage.getItem("defaultView");
//   if (storedView) setDefaultView(storedView);
// }, []);

// Lines 244-286 (accent color effect) - DELETE ENTIRE BLOCK

// Lines 288-292 (default view persist) - DELETE ENTIRE BLOCK

// In handleSaveProfile, change appearancePreferences from:
// appearancePreferences: {
//   darkMode,
//   accentColor,
//   defaultView,
// },
// TO:
// appearancePreferences: {
//   darkMode,
// },

// In Appearance tab, remove Accent Color buttons and Default View selector
// Keep only Dark Mode toggle
