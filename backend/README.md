# CheckSiteAEO Backend

The backend service for CheckSiteAEO, built with FastAPI. It handles crawling, LLM analysis, scheduling, and data persistence.

## Setup

1.  **Create a virtual environment:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

2.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Configure Environment:**
    ```bash
    cp .env.example .env
    ```
    Edit `.env` and fill in your API keys.

4.  **Run the Server:**
    ```bash
    uvicorn main:app --reload
    ```

## Environment Variables

The backend relies on several third-party services. Configure these in your `.env` file.

### Critical
-   `ALLOWED_ORIGINS`: Comma-separated list of allowed frontend domains (e.g., `http://localhost:3000,https://checksiteaeo.com`). **Required for CORS.**
-   `DATABASE_URL`: PostgreSQL connection string (Supabase Transaction Pool recommended).
-   `SUPABASE_URL`: Supabase project URL.
-   `SUPABASE_SERVICE_KEY`: Supabase **Service Role** key (for admin tasks/bypassing RLS).

### AI Providers
-   `GEMINI_API_KEY`: Google Gemini API key.
-   `MISTRAL_API_KEY`: Mistral AI API key.
-   `GROQ_API_KEY`: Groq API key for fast inference.

### Services
-   `RESEND_API_KEY`: Resend.com API key for transactional emails.
-   `STRIPE_SECRET_KEY`: Stripe secret key for payments.
-   `STRIPE_WEBHOOK_SECRET`: Stripe webhook signature secret.

### Optional / Dev
-   `ENABLE_RATE_LIMIT`: Set to `true` to enforce scan limits.
-   `MAILTRAP_*`: configuration for testing emails in development.
