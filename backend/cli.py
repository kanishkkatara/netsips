"""
Netsips CLI Digest Runner
Production command-line interface for compiling and dispatching newsletters.
"""

import os
import sys
import json
import logging
import argparse
from typing import List

from backend.config import Config
import backend.netsips_v4.netsips_pdf as npdf
import backend.netsips_v4.netsips_html as nhtml
import backend.netsips_v4.netsips_mail as nmail

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("netsips.cli")


def extract_urls_from_json(json_path: str) -> List[str]:
    """Extract article URLs from exported LocalDB JSON bookmarks."""
    if not os.path.exists(json_path):
        raise FileNotFoundError(f"Bookmarks file not found: {json_path}")

    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    urls = []
    items = data.get("bookmarks", data) if isinstance(data, dict) else data
    if isinstance(items, list):
        for item in items:
            if isinstance(item, dict):
                url = item.get("articleURL") or item.get("URL") or item.get("url")
                status = item.get("status", 100)
                if url and status != 102 and url not in urls:
                    urls.append(url)
            elif isinstance(item, str) and item.startswith("http"):
                urls.append(item)
    return urls


def run_digest(
    urls: List[str],
    output_dir: str = "./dist",
    recipient: str = None,
    send_email: bool = False,
    config: Config = None
) -> dict:
    """
    Core pipeline to generate PDF and HTML digests and optionally dispatch them.
    """
    if not urls:
        logger.warning("No URLs provided for digest generation.")
        return {"pdf": None, "html": None, "delivered": False}

    config = config or Config.from_env()
    os.makedirs(output_dir, exist_ok=True)

    pdf_path = os.path.join(output_dir, "netsips_digest.pdf")
    html_path = os.path.join(output_dir, "netsips_digest.html")

    logger.info(f"Generating digest for {len(urls)} items...")

    # 1. Compile PDF Digest
    try:
        npdf.generate_pdf(urls, output_path=pdf_path)
    except ImportError as e:
        logger.warning(f"PDF generation skipped: {e}")
        pdf_path = None
    except Exception as e:
        logger.error(f"Error compiling PDF digest: {e}", exc_info=True)
        pdf_path = None

    # 2. Compile HTML Digest
    try:
        html_content = nhtml.generate_html(urls, output_path=html_path)
    except Exception as e:
        logger.error(f"Error compiling HTML digest: {e}", exc_info=True)
        html_content = f"<h1>Netsips Digest</h1><p>Curated links: {', '.join(urls)}</p>"

    # 3. Deliver via SMTP if requested
    delivered = False
    target_recipient = recipient or config.recipient_email
    if send_email and target_recipient:
        delivered = nmail.send(html_content, target_recipient, pdf_path=pdf_path)
    else:
        logger.info(f"Digest generated successfully in '{output_dir}'. (Email dispatch not requested)")

    return {
        "pdf": pdf_path,
        "html": html_path,
        "delivered": delivered,
        "count": len(urls)
    }


def main():
    parser = argparse.ArgumentParser(
        description="Netsips CLI Digest Generator & Mailer",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter
    )
    parser.add_argument(
        "-i", "--input",
        help="Path to bookmarks JSON export or URLs file",
        default=None
    )
    parser.add_argument(
        "-u", "--url",
        action="append",
        dest="urls",
        help="Add one or more URLs directly (can be repeated)",
        default=[]
    )
    parser.add_argument(
        "-o", "--output-dir",
        help="Directory to save generated PDF and HTML digests",
        default="./dist"
    )
    parser.add_argument(
        "-r", "--recipient",
        help="Recipient email address",
        default=None
    )
    parser.add_argument(
        "--send",
        action="store_true",
        help="Send compiled digest to recipient via SMTP"
    )
    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Enable verbose debugging logs"
    )

    args = parser.parse_args()

    if args.verbose:
        logger.setLevel(logging.DEBUG)

    urls = list(args.urls)
    if args.input:
        try:
            urls.extend(extract_urls_from_json(args.input))
        except Exception as e:
            logger.error(f"Failed to read input file: {e}")
            sys.exit(1)

    if not urls:
        # Default sample if nothing passed to demonstrate functionality
        logger.info("No input provided. Generating sample digest with demo articles.")
        urls = [
            "https://en.wikipedia.org/wiki/Local-first_software",
            "https://en.wikipedia.org/wiki/Progressive_web_app"
        ]

    result = run_digest(
        urls=urls,
        output_dir=args.output_dir,
        recipient=args.recipient,
        send_email=args.send
    )

    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
