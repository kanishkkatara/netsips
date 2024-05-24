import os
import smtplib 
from email.mime.multipart import MIMEMultipart 
from email.mime.text import MIMEText 
from email.mime.base import MIMEBase 
from email import encoders 

def send(content, to, pdf_path='netsips.pdf'):
    """
    Sends the compiled digest HTML and optional PDF attachment via SMTP.
    Credentials and connection settings are loaded securely from environment variables.
    """
    smtp_host = os.environ.get('SMTP_HOST', 'smtp.gmail.com')
    smtp_port = int(os.environ.get('SMTP_PORT', 587))
    smtp_user = os.environ.get('SMTP_USER', os.environ.get('SENDER_EMAIL', 'care.netsips@example.com'))
    smtp_pass = os.environ.get('SMTP_PASS', os.environ.get('SMTP_PASSWORD', ''))

    print(f'Preparing digest email for: {to}')
    msg = MIMEMultipart() 
    msg['From'] = smtp_user
    msg['To'] = to
    msg['Subject'] = 'Your Netsips Digest'
    msg.attach(MIMEText(content, 'html')) 

    if pdf_path and os.path.exists(pdf_path):
        with open(pdf_path, 'rb') as attachment:
            p = MIMEBase('application', 'octet-stream')
            p.set_payload(attachment.read())
            encoders.encode_base64(p)
            p.add_header('Content-Disposition', f'attachment; filename={os.path.basename(pdf_path)}')
            msg.attach(p)

    if not smtp_pass:
        print('Info: SMTP_PASS environment variable is not set. Email delivery skipped in dry-run/mock mode.')
        return False

    try:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_user, to, msg.as_string())
        print(f'Digest successfully sent to {to}')
        return True
    except Exception as e:
        print(f'Failed to send email to {to}: {e}')
        return False
