import os
import urllib.request
import datetime

try:
    from fpdf import FPDF
except ImportError:
    FPDF = None

try:
    from newspaper import Article
except ImportError:
    Article = None

ASSET_DIR = os.path.dirname(os.path.abspath(__file__))

def generate_pdf(urls, output_path="netsips.pdf"):
    """
    Generates a PDF digest from a list of article URLs.
    Handles relative font/image assets and gracefully recovers from scraping errors.
    """
    if FPDF is None:
        raise ImportError("Package 'fpdf' is required for PDF generation. Install it via: pip install fpdf")

    print(f'Generating PDF digest with {len(urls)} items...')
    pdf = FPDF()
    font_path = os.path.join(ASSET_DIR, "NotoSans-Regular.ttf")
    if os.path.exists(font_path):
        pdf.add_font("NotoSans", style="", fname=font_path, uni=True)
        main_font = "NotoSans"
    else:
        main_font = "Helvetica"

    pdf.set_title('Netsips Newsletter')
    pdf.set_margins(left=30, top=20, right=30)
    pdf.add_page()

    icon_path = os.path.join(ASSET_DIR, 'icon_128.png')
    if os.path.exists(icon_path):
        image1 = pdf.add_link()
        pdf.set_link(image1, icon_path)
        pdf.image(icon_path, x=81, y=20, h=50)

    pdf.set_text_color(r=76, g=78, b=77)
    pdf.set_font(main_font, size=32)
    pdf.cell(150, 60, txt='', ln=1, align="L")
    pdf.multi_cell(150, 15, txt='NETSIPS PDF NEWSLETTER', align="C")
    pdf.set_font(main_font, size=15)
    pdf.multi_cell(150, 15, txt=str(datetime.date.today()), align="C")
    pdf.cell(150, 2, txt='___________________________________________________', ln=1, align="C")
    pdf.set_font(main_font, size=30)
    pdf.cell(150, 10, txt='', ln=1, align="L")
    pdf.multi_cell(150, 15, txt='Contents', align="L")
    pdf.cell(150, 10, txt='', ln=1, align="L")
    pdf.set_font(main_font, size=15)

    c = 1
    link = [0]
    pdf.set_text_color(r=76, g=78, b=79)

    parsed_articles = []
    for url in urls:
        if 'www.youtube.com' in str(url):
            continue
        if Article is None:
            title = url.split('/')[-1].replace('-', ' ').replace('_', ' ').title() or url
            link.append(pdf.add_link())
            pdf.set_font(main_font, size=20)
            pdf.multi_cell(150, 9, txt=f"{c}. {title}", align="L")
            pdf.set_font(main_font, size=15)
            pdf.set_text_color(r=41, g=128, b=185)
            pdf.cell(150, 10, border=0, txt='Click here to read', ln=1, align='R', fill=False, link=link[c])
            pdf.cell(150, 5, txt='', ln=1, align="L")
            pdf.set_text_color(r=76, g=78, b=79)
            c += 1
            parsed_articles.append((url, None))
            continue

        try:
            article = Article(url)
            article.download()
            article.parse()
            title = article.title or url
            link.append(pdf.add_link())
            pdf.set_font(main_font, size=20)
            pdf.multi_cell(150, 9, txt=f"{c}. {title}", align="L")
            pdf.set_font(main_font, size=15)
            pdf.set_text_color(r=41, g=128, b=185)
            pdf.cell(150, 10, border=0, txt='Click here to read', ln=1, align='R', fill=False, link=link[c])
            pdf.cell(150, 5, txt='', ln=1, align="L")
            pdf.set_text_color(r=76, g=78, b=79)
            c += 1
            parsed_articles.append((url, article))
        except Exception as e:
            print(f"Notice: Could not parse {url} for PDF contents: {e}")

    c = 1
    for url, article in parsed_articles:
        try:
            if article is None:
                title = url.split('/')[-1].replace('-', ' ').replace('_', ' ').title() or url
                text_paragraphs = [f"Curated reading link saved to your Netsips digest queue: {url}"]
                authors = "By: Netsips Curated"
            else:
                title = article.title or url
                y1 = article.text.encode('latin-1', 'ignore').decode('latin-1')
                text_paragraphs = [p.strip() for p in y1.split('\n') if len(p.strip()) > 30]
                authors = 'By: ' + ', '.join(article.authors) if article.authors else 'By: Netsips Curated'

            pdf.add_page()
            if c < len(link):
                pdf.set_link(link[c], page=pdf.page_no())
            c += 1

            white_bg = os.path.join(ASSET_DIR, 'ffffff.png')
            if os.path.exists(white_bg):
                image2 = pdf.add_link()
                pdf.set_link(image2, white_bg)
                pdf.image(white_bg, x=10, y=60, w=190)

            pdf.cell(150, 45, txt='', ln=1, align="L")
            pdf.set_text_color(r=157, g=157, b=157)
            pdf.set_font(main_font, size=12)
            domain = url.split('/')[2] if len(url.split('/')) > 2 else url
            pdf.multi_cell(150, 5, txt=domain, align="C")
            pdf.cell(150, 5, txt='', ln=1, align="L")
            pdf.set_text_color(r=76, g=78, b=77)
            pdf.set_font(main_font, size=24)
            pdf.multi_cell(150, 12, txt=title, align="C")
            pdf.cell(150, 2, txt='', ln=1, align="L")
            pdf.set_font(main_font, size=13)

            date_str = str(article.publish_date)[:10] if article.publish_date else str(datetime.date.today())
            pdf.multi_cell(150, 7, txt=f"{authors} | {date_str}", align="C")
            pdf.cell(150, 2, txt='___________________________________________________', ln=1, align="C")
            pdf.cell(150, 10, txt='', ln=1, align="L")
            pdf.set_text_color(r=76, g=78, b=79)
            pdf.set_font(main_font, size=11)

            for paragraph in text_paragraphs[:8]:
                if '|' not in paragraph:
                    pdf.cell(150, 2, txt='', ln=1, align="L")
                    pdf.multi_cell(150, 5, txt=paragraph, align="J")
        except Exception as e:
            print(f"Notice: Failed to render page for {url}: {e}")

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    pdf.output(output_path)
    print(f"PDF successfully written to: {output_path}")
    return output_path
