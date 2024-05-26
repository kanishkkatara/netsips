try:
    from newspaper import Article
except ImportError:
    Article = None

def sumary(text):
    """
    Extractive summarizer with graceful fallback if gensim is not available.
    """
    try:
        from gensim.summarization.summarizer import summarize
        sum_list = summarize(text, word_count=100, split=True)
        sum_str = ''
        for i in sum_list:
            if len(i.split()) > 4:
                sum_str += '‣ ' + str(i) + '<br>'
        if sum_str:
            return sum_str
    except Exception:
        pass

    # Resilient fallback: extract top key sentences from article text
    sentences = [s.strip() for s in text.replace('\r', ' ').replace('\n', ' ').split('.') if len(s.strip().split()) > 4]
    if not sentences:
        return '‣ Summary unavailable.<br>'
    return ''.join(f'‣ {s}.<br>' for s in sentences[:3])


def generate_html(urls, output_path=None):
    """
    Generates a clean HTML newsletter digest from a list of URLs.
    """
    print(f'Generating HTML newsletter for {len(urls)} items...')
    item_count = len(urls)
    count_label = f"{item_count} {'articles' if item_count != 1 else 'article'}"

    html = f'''<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Netsips Digest</title>
  <style type="text/css">
    body {{ margin: 0; padding: 0; background-color: #f7f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }}
    .container {{ max-width: 680px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }}
    .header {{ background: #242424; color: #ffd200; padding: 32px 24px; text-align: center; }}
    .header h1 {{ margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px; color: #ffd200; }}
    .subhead {{ color: #ffffff; opacity: 0.8; font-size: 15px; margin-top: 8px; }}
    .card {{ padding: 24px; border-bottom: 1px solid #ebebeb; }}
    .card-title {{ font-size: 20px; font-weight: 600; color: #202020; margin-bottom: 10px; line-height: 1.4; }}
    .card-title a {{ color: #202020; text-decoration: none; }}
    .card-title a:hover {{ color: #5B2E91; }}
    .card-summary {{ color: #555555; font-size: 14px; line-height: 1.6; margin-bottom: 14px; }}
    .btn {{ display: inline-block; background: #5B2E91; color: #ffffff !important; padding: 8px 18px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600; }}
    .footer {{ background: #313131; color: #aaaaaa; padding: 24px; text-align: center; font-size: 12px; }}
    .footer a {{ color: #ffd200; text-decoration: none; }}
  </style>
</head>
<body>
  <div style="padding: 24px 12px;">
    <div class="container">
      <div class="header">
        <h1>NETSIPS DIGEST</h1>
        <div class="subhead">You have {count_label} curated in your reading queue</div>
      </div>
'''

    for u in urls:
        url_str = str(u)
        is_yt = 'www.youtube.com' in url_str or 'youtu.be' in url_str
        try:
            article = Article(url_str)
            article.download()
            article.parse()
            title = article.title or url_str
            text = article.text
            summary_text = '‣ Video link curated via Netsips. Click below to watch.' if is_yt else sumary(text)
        except Exception:
            title = url_str
            summary_text = '‣ Curated reading link saved to your Netsips digest.'

        btn_text = "Watch Video" if is_yt else "Read Article"

        html += f'''      <div class="card">
        <div class="card-title"><a href="{url_str}" target="_blank">{title}</a></div>
        <div class="card-summary">{summary_text}</div>
        <div><a href="{url_str}" target="_blank" class="btn">{btn_text} &rarr;</a></div>
      </div>
'''

    html += '''      <div class="footer">
        <p>Curated automatically by Netsips | Keep your web reading focused and deliberate.</p>
      </div>
    </div>
  </div>
</body>
</html>'''

    if output_path:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f"HTML newsletter written to: {output_path}")

    return html