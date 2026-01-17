# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## Local development

This repo is a workspace with two apps: `backend` (Express + MongoDB) and `frontend` (Vite + React).

### One-time setup
```bash
# From repo root
cp backend/.env.example backend/.env
# Ensure MongoDB is running and edit backend/.env if needed

# Install dependencies for both apps and the root runner
npm run setup
```

### Run both apps together
```bash
npm run dev
```
- Backend: http://localhost:5000 (API health: /api/health)
- Frontend: prints dev URL (usually http://localhost:5173)

### Run separately (optional)
```bash
# Backend
cd backend
npm run dev

# Frontend (in another terminal)
cd frontend
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite (React)
- Express (Node)
- MongoDB (Mongoose)
- shadcn-ui + Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
