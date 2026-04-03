import os
import stripe
from dotenv import load_dotenv

load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

PACKS = [
    {
        "name": "CheckSite Tokens - Starter",
        "amount_cents": 1900,
        "tokens": int(os.getenv("TOKEN_PACK_STARTER_TOKENS", "100")),
        "env_var": "STRIPE_PRICE_ID_TOKENS_STARTER",
    },
    {
        "name": "CheckSite Tokens - Growth",
        "amount_cents": 7900,
        "tokens": int(os.getenv("TOKEN_PACK_GROWTH_TOKENS", "500")),
        "env_var": "STRIPE_PRICE_ID_TOKENS_GROWTH",
    },
    {
        "name": "CheckSite Tokens - Scale",
        "amount_cents": 24900,
        "tokens": int(os.getenv("TOKEN_PACK_SCALE_TOKENS", "2000")),
        "env_var": "STRIPE_PRICE_ID_TOKENS_SCALE",
    },
]


def create_products():
    if not stripe.api_key:
        raise RuntimeError("Missing STRIPE_SECRET_KEY")

    print("Creating token pack products...")

    for pack in PACKS:
        product = stripe.Product.create(name=pack["name"])
        price = stripe.Price.create(
            product=product.id,
            unit_amount=pack["amount_cents"],
            currency="usd",
            metadata={"tokens": str(pack["tokens"]), "pack": pack["name"]},
        )
        print(f"{pack['env_var']}={price.id}")


if __name__ == "__main__":
    create_products()
