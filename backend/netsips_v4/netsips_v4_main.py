import sys
import datetime
from newspaper import Article
from firebase import firebase
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import netsips_pdf as npdf
import netsips_mail as nmail
import netsips_html as nhtml

# realtime database
firebase = firebase.FirebaseApplication("https://netsips-1586535958950.firebaseio.com/", None)
all_users = firebase.get('/', '')
today = str(datetime.datetime.today().weekday())
ulist = list()
mails = list()
for uid in all_users:
    days = str(firebase.get('/'+uid+'/days', ''))
    if today in days:
        ulist.append(uid)
        mails.append(str(firebase.get('/'+uid+'/email', '')))

# cloud firestore
cred = credentials.Certificate('firebase-sdk.json')
firebase_admin.initialize_app(cred)
db = firestore.client()
for i in range(len(ulist)):
    uids = db.collection(ulist[i])
    user_urls = db.collection(ulist[i]).where('status', '==', 100).stream()
    url=list()
    for j in user_urls:
        u=j.to_dict()['articleURL']
        a=Article(u)
        a.download()
        try:
            a.parse()
            if a.is_valid_body() or 'www.youtube.com' in u:
                if u not in url:
                    url.append(u)
                uids.document(j.id).update({'status':101})
            else:
                uids.document(j.id).update({'status':103})
        except:
            uids.document(j.id).update({'status':103})
    if(len(url)>0):
        npdf.generate_pdf(url)
        html = nhtml.generate_html(url)
        nmail.send(html, mails[i])
        



