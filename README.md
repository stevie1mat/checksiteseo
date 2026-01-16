# CheckSiteAEO

CheckSite AEO is an AI-powered Answer Engine Optimization (AEO) audit tool. It helps content creators and businesses understand how their content is perceived and cited by Large Language Models (LLMs) like ChatGPT, Claude, and Perplexity.

## Project Structure

This monorepo contains two main applications:

-   **`frontend/`**: A Next.js 14 application providing the user interface, dashboard, and public pages.
-   **`backend/`**: A FastAPI (Python) service handling core analysis logic, scheduling, and database interactions.

## Quick Start

### 1. Backend Setup
Navigate to the `backend/` directory to set up the Python environment and API server.
See [backend/README.md](backend/README.md) for detailed instructions.

### 2. Frontend Setup
Navigate to the `frontend/` directory to install dependencies and run the Next.js app.
See [frontend/README.md](frontend/README.md) for configuration details.

---

## Environment Setup

Both frontend and backend require environment variables to be configured.

### Backend Setup

1. Navigate to `backend/` directory
2. Copy `.env.example` to `.env`:
   ```bash
   cd backend
   cp .env.example .env
   ```
3. Fill in your actual values in `.env`
4. See `backend/.env.example` for detailed documentation of all variables

### Frontend Setup

1. Navigate to `frontend/` directory
2. Copy `.env.example` to `.env.local`:
   ```bash
   cd frontend
   cp .env.example .env.local
   ```
3. Fill in your actual values in `.env.local`
4. See `frontend/.env.example` for detailed documentation of all variables

## Security Note

**Never commit `.env` or `.env.local` files to version control.**

- Backend: Use `.env` (gitignored)
- Frontend: Use `.env.local` (gitignored)
- Both: `.env.example` files are safe to commit and serve as templates
