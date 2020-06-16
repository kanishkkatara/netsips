import smtplib 
from email.mime.multipart import MIMEMultipart 
from email.mime.text import MIMEText 
from email.mime.base import MIMEBase 
from email import encoders 

def send(content, to):
    print('sending mail to: ',to)
    msg = MIMEMultipart() 
    msg['From'] = 'care.netsips@gmail.com'
    msg['To'] = to
    msg['Subject'] = 'Netsips'
    body = content
    msg.attach(MIMEText(body, 'html')) 
    filename = 'netsips.pdf'
    attachment = open(filename, "rb") 
    p = MIMEBase('application', 'octet-stream')
    p.set_payload((attachment).read()) 
    encoders.encode_base64(p) 
    p.add_header('Content-Disposition', "attachment; filename= %s" % filename) 
    msg.attach(p) 
    s = smtplib.SMTP('smtp.gmail.com', 587) 
    s.starttls() 
    s.login('care.netsips@gmail.com', "netsips@01") 
    text = msg.as_string() 
    s.sendmail('care.netsips@gmail.com', to, text) 
    s.quit() 
