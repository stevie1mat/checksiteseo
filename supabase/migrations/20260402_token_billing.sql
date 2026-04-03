-- Token-based billing migration
-- Adds token balance accounting and helper RPC functions.

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS token_balance INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_tokens_used INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_tokens_purchased INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS daily_free_tokens_last_granted_at DATE;

CREATE TABLE IF NOT EXISTS public.token_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tokens INTEGER NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN (
        'daily_grant',
        'purchase',
        'scan_usage',
        'manual_adjustment',
        'refund'
    )),
    description TEXT,
    stripe_session_id TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_token_transactions_user_created_at
    ON public.token_transactions (user_id, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_token_transactions_unique_stripe_session
    ON public.token_transactions (stripe_session_id)
    WHERE stripe_session_id IS NOT NULL;

ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'token_transactions'
          AND policyname = 'Users can view their own token transactions'
    ) THEN
        CREATE POLICY "Users can view their own token transactions"
        ON public.token_transactions
        FOR SELECT
        USING (auth.uid() = user_id);
    END IF;
END;
$$;

GRANT SELECT ON public.token_transactions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.token_transactions TO service_role;

CREATE OR REPLACE FUNCTION public.grant_daily_free_tokens(
    p_user_id UUID,
    p_tokens INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_new_balance INTEGER;
BEGIN
    IF p_tokens <= 0 THEN
        RETURN jsonb_build_object('granted', false, 'new_balance', NULL, 'reason', 'invalid_token_amount');
    END IF;

    UPDATE public.profiles
    SET token_balance = COALESCE(token_balance, 0) + p_tokens,
        daily_free_tokens_last_granted_at = (now() AT TIME ZONE 'utc')::date
    WHERE id = p_user_id
      AND (
        daily_free_tokens_last_granted_at IS NULL
        OR daily_free_tokens_last_granted_at < (now() AT TIME ZONE 'utc')::date
      )
    RETURNING token_balance INTO v_new_balance;

    IF FOUND THEN
        INSERT INTO public.token_transactions (
            user_id,
            tokens,
            transaction_type,
            description,
            metadata
        ) VALUES (
            p_user_id,
            p_tokens,
            'daily_grant',
            'Daily free token grant',
            jsonb_build_object('date_utc', (now() AT TIME ZONE 'utc')::date)
        );

        RETURN jsonb_build_object('granted', true, 'new_balance', v_new_balance);
    END IF;

    SELECT COALESCE(token_balance, 0)
      INTO v_new_balance
      FROM public.profiles
     WHERE id = p_user_id;

    RETURN jsonb_build_object('granted', false, 'new_balance', COALESCE(v_new_balance, 0));
END;
$$;

CREATE OR REPLACE FUNCTION public.consume_tokens(
    p_user_id UUID,
    p_tokens INTEGER,
    p_reason TEXT DEFAULT 'scan_usage'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_new_balance INTEGER;
    v_balance INTEGER;
BEGIN
    IF p_tokens <= 0 THEN
        RETURN jsonb_build_object('success', false, 'balance', NULL, 'reason', 'invalid_token_amount');
    END IF;

    UPDATE public.profiles
    SET token_balance = token_balance - p_tokens,
        total_tokens_used = COALESCE(total_tokens_used, 0) + p_tokens
    WHERE id = p_user_id
      AND COALESCE(token_balance, 0) >= p_tokens
    RETURNING token_balance INTO v_new_balance;

    IF FOUND THEN
        INSERT INTO public.token_transactions (
            user_id,
            tokens,
            transaction_type,
            description,
            metadata
        ) VALUES (
            p_user_id,
            -p_tokens,
            'scan_usage',
            COALESCE(NULLIF(p_reason, ''), 'Token usage'),
            '{}'::jsonb
        );

        RETURN jsonb_build_object('success', true, 'balance', v_new_balance);
    END IF;

    SELECT COALESCE(token_balance, 0)
      INTO v_balance
      FROM public.profiles
     WHERE id = p_user_id;

    RETURN jsonb_build_object('success', false, 'balance', COALESCE(v_balance, 0));
END;
$$;

CREATE OR REPLACE FUNCTION public.add_tokens(
    p_user_id UUID,
    p_tokens INTEGER,
    p_transaction_type TEXT DEFAULT 'purchase',
    p_description TEXT DEFAULT NULL,
    p_stripe_session_id TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_new_balance INTEGER;
BEGIN
    IF p_tokens = 0 THEN
        RETURN jsonb_build_object('success', false, 'new_balance', NULL, 'reason', 'zero_token_amount');
    END IF;

    UPDATE public.profiles
    SET token_balance = COALESCE(token_balance, 0) + p_tokens,
        total_tokens_purchased = COALESCE(total_tokens_purchased, 0) + CASE WHEN p_tokens > 0 THEN p_tokens ELSE 0 END
    WHERE id = p_user_id
    RETURNING token_balance INTO v_new_balance;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'new_balance', NULL, 'reason', 'profile_not_found');
    END IF;

    INSERT INTO public.token_transactions (
        user_id,
        tokens,
        transaction_type,
        description,
        stripe_session_id,
        metadata
    ) VALUES (
        p_user_id,
        p_tokens,
        COALESCE(NULLIF(p_transaction_type, ''), 'manual_adjustment'),
        p_description,
        p_stripe_session_id,
        COALESCE(p_metadata, '{}'::jsonb)
    );

    RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance);
END;
$$;

GRANT EXECUTE ON FUNCTION public.grant_daily_free_tokens(UUID, INTEGER) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.consume_tokens(UUID, INTEGER, TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.add_tokens(UUID, INTEGER, TEXT, TEXT, TEXT, JSONB) TO service_role;
