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
-   `GROQ_API_KEY`: Groq API key (used for the free daily scan).
-   `EDEN_API_KEY`: Eden API key (used for paid/additional scans and model chat).
-   `EDEN_API_BASE_URL`: Eden base URL (`https://api.edenai.run`).
-   `EDEN_DEFAULT_MODEL`: Default Eden chat model (`openai/gpt-4o-mini`).

### Services
-   `RESEND_API_KEY`: Resend.com API key for transactional emails.
-   `STRIPE_SECRET_KEY`: Stripe secret key for payments.
-   `STRIPE_WEBHOOK_SECRET`: Stripe webhook signature secret.
-   `STRIPE_PRICE_ID_TOKENS_STARTER`: Stripe price ID for starter token pack.
-   `STRIPE_PRICE_ID_TOKENS_GROWTH`: Stripe price ID for growth token pack.
-   `STRIPE_PRICE_ID_TOKENS_SCALE`: Stripe price ID for scale token pack.

### Optional / Dev
-   `ENABLE_RATE_LIMIT`: Set to `true` to enforce scan limits.
-   `DAILY_FREE_TOKENS`: Number of free tokens granted per user per day (default `1000`).
-   `TOKENS_PER_SCAN`: Minimum token hold charged before a scan (default `1000`), then auto-settled against model usage.
-   `TOKENS_PER_CHAT`: Minimum token hold charged before each site chat message (default `300`), then auto-settled against model usage.
-   `MAX_SITES_PER_USER`: Max allowed sites per account.
-   `TOKEN_PACK_STARTER_TOKENS`: Number of tokens credited for starter pack.
-   `TOKEN_PACK_GROWTH_TOKENS`: Number of tokens credited for growth pack.
-   `TOKEN_PACK_SCALE_TOKENS`: Number of tokens credited for scale pack.
-   `ENABLE_LEGACY_PLAN_GATES`: Set to `true` to keep old Plus/Pro feature gates.
-   `MAILTRAP_*`: configuration for testing emails in development.
