import stripe
import os
from dotenv import load_dotenv

load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

def create_products():
    print("Creating products...")
    
    try:
        # Create Plus Product
        plus = stripe.Product.create(name="CheckSite Plus")
        plus_price = stripe.Price.create(
            product=plus.id,
            unit_amount=1500, # $15.00
            currency="usd",
            recurring={"interval": "month"},
        )
        print(f"STRIPE_PRICE_ID_PLUS={plus_price.id}")
        
        # Create Pro Product
        pro = stripe.Product.create(name="CheckSite Pro")
        pro_price = stripe.Price.create(
            product=pro.id,
            unit_amount=2500, # $25.00
            currency="usd",
            recurring={"interval": "month"},
        )
        print(f"STRIPE_PRICE_ID_PRO={pro_price.id}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    create_products()
