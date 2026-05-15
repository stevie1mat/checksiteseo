-- Token billing settlement improvements
-- - Adds optional metadata to consume_tokens so we can attribute charges.
-- - Adds refund_tokens to refund unused "hold" amounts while keeping totals consistent.

DROP FUNCTION IF EXISTS public.consume_tokens(UUID, INTEGER, TEXT);

CREATE OR REPLACE FUNCTION public.consume_tokens(
    p_user_id UUID,
    p_tokens INTEGER,
    p_reason TEXT DEFAULT 'scan_usage',
    p_metadata JSONB DEFAULT '{}'::jsonb
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
            COALESCE(p_metadata, '{}'::jsonb)
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

CREATE OR REPLACE FUNCTION public.refund_tokens(
    p_user_id UUID,
    p_tokens INTEGER,
    p_reason TEXT DEFAULT 'refund',
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
    IF p_tokens <= 0 THEN
        RETURN jsonb_build_object('success', false, 'new_balance', NULL, 'reason', 'invalid_token_amount');
    END IF;

    UPDATE public.profiles
    SET token_balance = COALESCE(token_balance, 0) + p_tokens,
        total_tokens_used = GREATEST(COALESCE(total_tokens_used, 0) - p_tokens, 0)
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
        metadata
    ) VALUES (
        p_user_id,
        p_tokens,
        'refund',
        COALESCE(NULLIF(p_reason, ''), 'Refund'),
        COALESCE(p_metadata, '{}'::jsonb)
    );

    RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance);
END;
$$;

GRANT EXECUTE ON FUNCTION public.consume_tokens(UUID, INTEGER, TEXT, JSONB) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.refund_tokens(UUID, INTEGER, TEXT, JSONB) TO service_role;

