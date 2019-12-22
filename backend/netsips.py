import sys
from newspaper import Article

url=list()
url.append('https://yourstory.com/socialstory/2019/12/india-top-10-nations-climate-change-performance-index?utm_pageloadtype=scroll')
url.append('https://www.businessinsider.in/politics/news/trump-slams-fox-news-for-interviewing-comey-and-schiff-stating-only-pro-trump-shows-do-well-on-the-channel/articleshow/72650072.cms')
url.append('https://timesofindia.indiatimes.com/india/will-tweak-citizenship-amendment-act-if-needed-says-amit-shah/articleshow/72642452.cms')
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
    images.append(article.images)
    movies.append(article.movies)
    keywords.append(article.keywords)
    summary.append(article.summary)
from yattag import Doc
doc, tag, text = Doc().tagtext()
username='kanishk'
with tag('html'):
    with tag('body'):
        with tag('h1'):
            text('NETSIPS')
        for i in range(len(url)):
            with tag('h2'):
                text(str(title[i]))
            with tag('p'):
                text(str(summary[i]))
            with tag('p'):
                text('Read the full article here : ',str(url[i]))
print(doc.getvalue())
'''
t=list()
for i in range(len(url)):
    t.append(str(title[i])+'\n'+str(summary[i])+'\n'+'Read the full article here : '+str(url[i])+'\n')
    print(t[i])
'''
'''
for i in range(len(url)):
    print(title[i])
    print()
    print(summary[i])
    print()
    print ('Read the full article here : '+url[i])
    print()
    print('-------------------------------------------------------------------------------------------------------')
    print()
    '''
'''
import smtplib
fromaddr = 'kanishkkatara@gmail.com'
toaddrs  = 'sayansahay11@gmail.com'
msg = 
server = smtplib.SMTP("smtp.gmail.com:587")
server.starttls()
server.login(username,password)
server.sendmail(fromaddr, toaddrs, msg)
server.quit()


'''

