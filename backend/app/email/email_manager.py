import smtplib
from email.message import EmailMessage
from ..config import get_settings

settings = get_settings()

def send_email_sync(to_email: str, subject: str, html: str, nohtml: str):
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = settings.EMAIL_FROM
    msg["To"] = to_email
    msg.set_content(nohtml)
    msg.add_alternative(html, subtype="html")

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as s:
        if settings.SMTP_STARTTLS:
            s.starttls()
        if settings.SMTP_USER and settings.SMTP_PASS:
            s.login(settings.SMTP_USER, settings.SMTP_PASS)
        s.send_message(msg)

def email_verification_html(name: str, code: str) -> str:
    return f"""
    <div style="font-family:system-ui,Segoe UI,Arial;max-width:480px">
      <h2>Verify your email</h2>
      <p>Hi {name}, your verification code is:</p>
      <div style="font-size:28px;letter-spacing:4px;font-weight:700">{code}</div>
      <p>This code expires in {settings.VERIFICATION_TTL_MIN} minutes.</p>
    </div>
    """
