# Copilot Instructions
- Purpose: Vite + React + TypeScript job-hunt dashboard with static demo data, Tailwind styling, and shadcn-ui/Radix primitives.
- Key entry: routing and providers live in [src/App.tsx](src/App.tsx) (BrowserRouter, react-query `QueryClientProvider`, toasters, theme provider). Add new routes above the catch-all `*` route.
- Mount point: [src/main.tsx](src/main.tsx) renders `<App />` and imports global styles from [src/index.css](src/index.css).
- Path alias: `@/*` maps to `src/*` (see [tsconfig.json](tsconfig.json)). Prefer alias imports for local modules.
- Layout pattern: pages wrap content with [src/components/layout/Sidebar.tsx](src/components/layout/Sidebar.tsx) and [src/components/layout/Header.tsx](src/components/layout/Header.tsx); main content sits inside a `ml-20 lg:ml-64` container to account for the sidebar.
- Pages and routes: dashboard [src/pages/Index.tsx](src/pages/Index.tsx), applications [src/pages/Applications.tsx](src/pages/Applications.tsx), job search [src/pages/JobSearch.tsx](src/pages/JobSearch.tsx), resumes [src/pages/Resumes.tsx](src/pages/Resumes.tsx), reminders [src/pages/Reminders.tsx](src/pages/Reminders.tsx), settings [src/pages/Settings.tsx](src/pages/Settings.tsx), fallback [src/pages/NotFound.tsx](src/pages/NotFound.tsx).
- UI kit: shadcn-generated components under [src/components/ui](src/components/ui); keep styles Tailwind-first and reuse variants instead of inline CSS. Custom gradients/glass effects rely on Tailwind utilities (e.g., `glass`, `glass-hover`, `bg-primary/5`).
- Icons: lucide-react is the shared icon set; prefer existing imports from the page to keep bundle lean.
- State/data: current pages use local `useState` plus static arrays for table/list rendering; filters and toggles work client-side only. React Query client is pre-wired but unused—if adding server data, source it through `QueryClientProvider` in [src/App.tsx](src/App.tsx).
- Animations: Tailwind-based classes like `opacity-0 animate-fade-in` with optional inline `animationDelay`; maintain these for consistency when adding new blocks.
- Theming: dark is default via [src/components/ThemeProvider.tsx](src/components/ThemeProvider.tsx) (next-themes). Use `bg-background`, `text-foreground`, and `muted` tokens instead of hard colors.
- Notifications: two toaster systems are wired—`<Toaster />` (shadcn) and `<Sonner />` (sonner). Reuse existing providers; do not mount additional toasters in pages.
- Forms/inputs: prefer shadcn form primitives in [src/components/ui/form.tsx](src/components/ui/form.tsx) when adding validated forms; zod + react-hook-form are available via deps.
- Charts: dashboard activity uses recharts via [src/components/dashboard/ActivityChart.tsx](src/components/dashboard/ActivityChart.tsx); reuse that pattern for new charts.
- Tables: applications table uses shadcn table primitives [src/components/ui/table.tsx](src/components/ui/table.tsx) with `Badge` status styles defined in-page; mirror that approach for new status chips.
- Responsive layout: grids typically switch at `sm`, `lg`, `xl`; maintain sidebar offsets and avoid fixed widths in page content.
- Scripts: `npm install`, `npm run dev` (Vite), `npm run build`, `npm run preview`, `npm run lint` (ESLint 9). No tests are configured.
- Styling config: Tailwind + tailwindcss-animate; global theme tokens in [src/index.css](src/index.css) and [src/App.css](src/App.css) if needed.
- Deployment: no specific pipeline; Vite static output lives in `dist/`.

Ask to clarify: Is anything missing or inaccurate for how you want agents to work in this repo?