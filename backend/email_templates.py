def get_email_html(headline: str, body_text: str, cta_text: str = None, cta_link: str = None) -> str:
    """
    Generates a beautiful, responsive HTML email template for CheckSite AEO.
    """
    
    # Brand Colors
    # Dark Green: #1A4036
    # Light Green: #8CD9B8
    # Background: #F8FAFC
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            body {{ font-family: 'Inter', sans-serif; margin: 0; padding: 0; background-color: #F8FAFC; }}
            .container {{ max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-top: 40px; margin-bottom: 40px; }}
            .header {{ background-color: #1A4036; padding: 32px; text-align: center; }}
            .logo-text {{ color: #ffffff; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: -0.5px; text-decoration: none; }}
            .logo-accent {{ color: #8CD9B8; }}
            .content {{ padding: 40px 32px; }}
            .headline {{ font-size: 22px; color: #1e293b; font-weight: 700; margin-bottom: 16px; margin-top: 0; }}
            .body-text {{ font-size: 16px; color: #475569; line-height: 1.6; margin-bottom: 32px; }}
            .cta-button {{ display: inline-block; background-color: #1A4036; color: #ffffff !important; padding: 14px 28px; border-radius: 8px; font-weight: 600; text-decoration: none; font-size: 16px; transition: background-color 0.2s; }}
            .footer {{ background-color: #F1F5F9; padding: 24px; text-align: center; font-size: 13px; color: #94a3b8; }}
            .divider {{ height: 1px; background-color: #e2e8f0; margin: 16px 0; }}
        </style>
    </head>
    <body>
        <div style="background-color: #F8FAFC; padding: 20px;">
            <div class="container">
                <!-- Header -->
                <div class="header">
                    <div class="logo-text">CheckSite<span class="logo-accent">AEO</span></div>
                </div>
                
                <!-- Content -->
                <div class="content">
                    <h1 class="headline">{headline}</h1>
                    <p class="body-text">{body_text}</p>
                    
                    {f'<div style="text-align: center;"><a href="{cta_link}" class="cta-button" style="color: #ffffff;">{cta_text}</a></div>' if cta_link else ''}
                </div>
                
                <!-- Footer -->
                <div class="footer">
                    <p>&copy; {2024} CheckSite AEO. All rights reserved.</p>
                    <p>Optimizing your presence in the age of AI.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    return html
