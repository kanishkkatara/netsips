import sys
import datetime
from newspaper import Article
import mysql.connector
import netsips_pdf as npdf
import netsips_mail as nmail
import netsips_html as nhtml

mydb = mysql.connector.connect(
    host="remotemysql.com",
    user="iGnnLa8zV6",
    passwd="Pn2j3CEhRX",
    database="iGnnLa8zV6"
)
print('connected')
mycursor = mydb.cursor()
d=dict()
mycursor.execute("SELECT * FROM logs")
logs = mycursor.fetchall()
mycursor.execute("SELECT * FROM sent")
sent = mycursor.fetchall()
mycursor.execute("SELECT * FROM unsent")
unsent = mycursor.fetchall()
mycursor.execute("SELECT * FROM user")
users = mycursor.fetchall()
today=datetime.datetime.today().weekday()
ulist=list()
for i in users:
    days=i[3].split()
    if str(today) in days:
        ulist.append(i[0])
mails=list()
for i in range(len(logs)):
    if len(logs[i][2])>0:
        a=Article(logs[i][3])
        a.download()
        try:
            a.parse()
            if a.is_valid_body() or 'www.youtube.com' in logs[i][3]:
                if logs[i][1] in ulist:
                    if logs[i][2] not in d:
                        d[logs[i][2]]=list()
                        mails.append(logs[i][2])
                else:
                    continue
                d[logs[i][2]].append(logs[i][3])
            else:
                if logs[i][1] in ulist:
                    sql1="INSERT INTO unsent (uid, email, url, timestamp) SELECT uid, email, url, timestamp FROM logs WHERE url='"+str(logs[i][3])+"'"
                    mycursor.execute(sql1)
                    sql1 = "DELETE FROM logs WHERE url='"+str(logs[i][3])+"'"
                    mycursor.execute(sql1)
                else:
                    continue
        except:
            if logs[i][1] in ulist:
                sql1="INSERT INTO unsent (uid, email, url, timestamp) SELECT uid, email, url, timestamp FROM logs WHERE url='"+str(logs[i][3])+"'"
                mycursor.execute(sql1)
                sql1 = "DELETE FROM logs WHERE url='"+str(logs[i][3])+"'"
                mycursor.execute(sql1)
            else:
                continue

for i1 in mails:
    allurls=d[i1]
    allurls = list(dict.fromkeys(allurls))
    url=list()
    for i in range(len(allurls)):
        try:
            article = Article(str(allurls[i]))
            if(article.is_valid_url()):
                url.append(allurls[i])
                sql1="INSERT INTO sent (uid, email, url, timestamp) SELECT uid, email, url, timestamp FROM logs WHERE url='"+str(allurls[i])+"'"
                mycursor.execute(sql1)
                sql1 = "DELETE FROM logs WHERE url='"+str(allurls[i])+"'"
                mycursor.execute(sql1)
                mydb.commit()
            else:
                sql1="INSERT INTO unsent (uid, email, url, timestamp) SELECT uid, email, url, timestamp FROM logs WHERE url='"+str(allurls[i])+"'"
                mycursor.execute(sql1)
                sql1 = "DELETE FROM logs WHERE url='"+str(allurls[i])+"'"
                mycursor.execute(sql1)
        except:
            sql1="INSERT INTO unsent (uid, email, url, timestamp) SELECT uid, email, url, timestamp FROM logs WHERE url='"+str(allurls[i])+"'"
            mycursor.execute(sql1)
            sql1 = "DELETE FROM logs WHERE url='"+str(allurls[i])+"'"
            mycursor.execute(sql1)
    if(len(url)>0):
        npdf.generate_pdf(url)
        html = nhtml.generate_html(url)
        if __name__ == "__main__": 
            nmail.send(html, str(i1))
print('done')