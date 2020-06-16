import os 
from fpdf import FPDF
import urllib.request
import random
import datetime
from newspaper import Article
def generate_pdf(urls):
    print('generating pdf...')
    pdf = FPDF()
    pdf.add_font("NotoSans", style="", fname="NotoSans-Regular.ttf", uni=True)
    pdf.set_title('Netsips newsletter')
    pdf.set_margins(left=30, top=20, right=30)
    pdf.add_page()
    image1 = pdf.add_link()
    pdf.set_link(image1, 'icon_128.png')
    pdf.image('icon_128.png', x=81, y=20, h=50)
    pdf.set_text_color(r=76, g=78, b=77)
    pdf.set_font("NotoSans", size=32)
    pdf.cell(150, 60, txt='', ln=1, align="L")
    pdf.multi_cell(150, 15, txt='NETSIPS PDF NEWSLETTER', align="C")
    pdf.set_font("NotoSans", size=15)
    pdf.multi_cell(150, 15, txt=str(datetime.date.today()), align="C")
    pdf.cell(150, 2, txt='___________________________________________________', ln=1, align="C")
    pdf.set_font("NotoSans", size=30)
    pdf.cell(150, 10, txt='', ln=1, align="L")
    pdf.multi_cell(150, 15, txt='Contents', align="L")
    pdf.cell(150, 10, txt='', ln=1, align="L")
    pdf.set_font("NotoSans", size=15)
    c=1
    link=[0]
    pdf.set_text_color(r=76, g=78, b=79)
    for url in urls:
        if 'www.youtube.com' not in url:
            article = Article(url)
            article.download()
            article.parse()
            title=  article.title
            link.append(pdf.add_link())
            pdf.set_font("NotoSans", size=20)
            pdf.multi_cell(150, 9, txt=str(c)+'. '+title, align="L")
            pdf.set_font("NotoSans", size=15)
            pdf.set_text_color(r=41, g=128, b=185)
            pdf.cell(150, 10, border=0,txt='Click here to read', ln=1, align='R', fill=False, link=link[c])
            pdf.cell(150, 5, txt='', ln=1, align="L")
            pdf.set_text_color(r=76, g=78, b=79)
            c=c+1
    c=1
    for url in urls:
        if 'www.youtube.com' not in url:
            article = Article(url)
            article.download()
            article.parse()
            title=  article.title
            print(title)
            y1 = article.text
            y1 = y1.encode('latin-1', 'ignore')
            y1= str(y1)
            y=y1[2:].split('\n')
            text=y[0].split('\\n\\n')
            authors= 'By: '
            for i in article.authors:
                authors=authors+i+', '
            authors=authors[:-2]
            pdf.add_page()
            pdf.set_link(link[c], page=pdf.page_no())
            c=c+1
            try:
                urllib.request.urlretrieve(article.top_image,'temp.jpg')
                image1 = pdf.add_link()
                pdf.set_link(image1, 'temp.jpg')
                pdf.image('temp.jpg', x=0, y=0, w=210)
            except:
                print(c,article.title[:20])
                try:
                    urllib.request.urlretrieve('https://source.unsplash.com/random','temp.jpeg')
                    image1 = pdf.add_link()
                    pdf.set_link(image1, 'temp.jpeg')
                    pdf.image('temp.jpeg', x=0, y=0, w=210)
                except:
                    image1 = pdf.add_link()
                    pdf.set_link(image1, 'fff000.png')
                    pdf.image('fff000.png', x=0, y=0, w=210)
            image2 = pdf.add_link()
            pdf.set_link(image2, 'ffffff.png')
            pdf.image('ffffff.png', x=10, y=60, w=190)
            pdf.cell(150, 45, txt='', ln=1, align="L")
            pdf.set_text_color(r=157, g=157, b=157)
            pdf.set_font("NotoSans", size=12)
            pdf.multi_cell(150, 5, txt=url.split('/')[2], align="C")
            pdf.cell(150, 5, txt='', ln=1, align="L")
            pdf.set_text_color(r=76, g=78, b=77)
            pdf.set_font("NotoSans", size=35)
            pdf.multi_cell(150, 15, txt=title, align="C")
            pdf.cell(150, 2, txt='', ln=1, align="L")
            pdf.set_font("NotoSans", size=15)
            try:
                if article.publish_date!=None:
                    pdf.multi_cell(150, 7, txt='By: '+article.authors[0] +' | '+str(article.publish_date)[:10], align="C")
                else:
                    pdf.multi_cell(150, 7, txt='By: '+article.authors[0], align="C")
            except:
                if article.publish_date!=None:
                    pdf.multi_cell(150, 7, txt=str(article.publish_date)[:10], align="C")
            pdf.cell(150, 2, txt='___________________________________________________', ln=1, align="C")

            pdf.cell(150, 10, txt='', ln=1, align="L")
            pdf.set_text_color(r=76, g=78, b=79)
            pdf.set_font("NotoSans", size=12)
            for i in text:
                if '|' not in i and len(i)>40:
                    pdf.cell(150, 2, txt='', ln=1, align="L")
                    pdf.multi_cell(150, 5, txt=i, align="J")
    pdf.output("netsips.pdf")
