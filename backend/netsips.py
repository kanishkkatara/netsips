import sys
from newspaper import Article
from yattag import Doc
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import mysql.connector

mydb = mysql.connector.connect(
    host="localhost",
    user="root",
    passwd="",
    database="netsips"
)
mycursor = mydb.cursor()
d=dict()
mycursor.execute("SELECT * FROM logs")
logs = mycursor.fetchall()
mycursor.execute("SELECT * FROM user_data")
udata = mycursor.fetchall()
uids=list()
for i in range(len(logs)):
    if logs[i][0] not in d:
        d[logs[i][0]]=list()
        uids.append(logs[i][0])
    d[logs[i][0]].append(logs[i][2])

for i1 in uids:
    sql ="SELECT mailid FROM user_data WHERE uid = %s"
    adr = (str(i1),)
    mycursor.execute(sql, adr)
    mid=mycursor.fetchall()
    url=d[i1]
    title=list()
    authors=list()
    publish_date=list()
    text=list()
    images=list()
    movies=list()
    keywords=list()
    summary=list()
    for i in range(len(url)):
        u=url[i]
        article = Article(u)
        article.download()
        article.parse()
        article.nlp()
        title.append(article.title)
        authors.append(article.authors)
        publish_date.append(article.publish_date)
        text.append(article.text)
        images.append(article.top_image)
        movies.append(article.movies)
        keywords.append(article.keywords)
        summary.append(article.summary)

    doc, tag, text = Doc().tagtext()
    username='kanishk'
    with tag('html'):
        with tag('body', style="font-family:verdana;"):
            with tag('center'):
                doc.stag('img', src='https://drive.google.com/uc?id=1UuFEBJAGaIthahsTfZ0SJCO6ZN56dHXL', style="width:350px;height:150px;", klass="photo")
            for i in range(len(url)):
                with tag('h2',style="color:black"):
                    text(str(title[i]))
                with tag('p',style="color:rgb(5, 78, 107);text-align:justify;"):
                    text(str(summary[i]))
                with tag('p'):
                    with tag('center'):
                        doc.stag('img', src=images[i], klass="photo")
                if(len(movies[i])>0):
                    with tag('p'):
                        with tag('center'):
                            with tag("iframe", src=movies[i][0]):
                                text(' ')
                with tag('p'):
                    with tag('center'):
                        text('Read the full article here : ',str(url[i]))
            with tag('center'):
                with tag('p', style="font-size:12px"):
                    text('NETSIPS India pvt. ltd. | www.netsips.in | care.netsips@gmail.com | Technology and Business Incubator, BITS Pilani Hyderabad Campus, Shameerpet, Jawaharnagar, Hyderabad, 500078')
                    doc.stag('br')
                    text('You are recieving this mail because you are registered on Netsips.in with this email address. If you wish to opt out of these mails, ')
                    with tag('a', href="http://www.netsips.in/unsubscribe.php"):
                        text('click here')
                    doc.stag('br')
                    text('Read our ')
                    with tag('a', href="http://www.netsips.in/terms-conditions.html"):
                        text('Terms & Conditions,')
                    with tag('a', href="http://www.netsips.in/privacy-policy.html"):
                        text(' Privacy Policy')

    def py_mail(SUBJECT, BODY, TO, FROM):
        MESSAGE = MIMEMultipart('alternative')
        MESSAGE['subject'] = SUBJECT
        MESSAGE['To'] = TO
        MESSAGE['From'] = FROM
        MESSAGE.preamble = """"""
        HTML_BODY = MIMEText(BODY, 'html')
        MESSAGE.attach(HTML_BODY)
        server = smtplib.SMTP('smtp.gmail.com:587') 
        if __name__ == "__main__":
            server.set_debuglevel(1)
        password = 'smilemiddle#1'
        server.starttls()
        server.login(FROM,password)
        server.sendmail(FROM, [TO], MESSAGE.as_string())
        server.quit()
    if udata[i1-1][3]=="Active":
        if __name__ == "__main__": 
            email_content = doc.getvalue() 
            TO = str(mid[0][0])
            FROM ='anishasrivastava53@gmail.com' 
            py_mail("Netsips daily mail", email_content, TO, FROM)