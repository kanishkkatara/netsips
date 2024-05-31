"""
Netsips Legacy Firebase Digest Worker (v4)
Polls Firebase Cloud Firestore and Realtime Database for scheduled delivery days.
For local/standalone execution, use `python -m backend.main`.
"""

import os
import sys
import datetime
import logging

try:
    from newspaper import Article
except ImportError:
    Article = None

try:
    from backend.netsips_v4 import netsips_pdf as npdf
    from backend.netsips_v4 import netsips_mail as nmail
    from backend.netsips_v4 import netsips_html as nhtml
except ImportError:
    import netsips_pdf as npdf
    import netsips_mail as nmail
    import netsips_html as nhtml

logger = logging.getLogger("netsips.worker")


def run_firebase_worker():
    """Execute scheduled digest poll against Firebase backend."""
    try:
        from firebase import firebase
        import firebase_admin
        from firebase_admin import credentials, firestore
    except ImportError:
        logger.warning(
            "Firebase SDK dependencies not installed. "
            "For local digest generation, run: python -m backend.main --input <bookmarks.json>"
        )
        return False

    db_url = os.environ.get("FIREBASE_DATABASE_URL", "")
    cred_path = os.environ.get("FIREBASE_CREDENTIALS_PATH", "firebase-sdk.json")

    if not db_url or not os.path.exists(cred_path):
        logger.warning(
            "Firebase database URL or credentials not configured. "
            "For offline/local digests, use: python -m backend.main --input <bookmarks.json>"
        )
        return False

    logger.info("Connecting to Firebase Realtime Database...")
    try:
        fb_app = firebase.FirebaseApplication(db_url, None)
        all_users = fb_app.get('/', '') or {}
    except Exception as e:
        logger.error(f"Failed to query Realtime Database: {e}")
        return False

    today = str(datetime.datetime.today().weekday())
    ulist = []
    mails = []
    for uid, user_data in all_users.items():
        if isinstance(user_data, dict):
            days = str(user_data.get('days', ''))
            email = str(user_data.get('email', ''))
        else:
            days = str(fb_app.get(f'/{uid}/days', ''))
            email = str(fb_app.get(f'/{uid}/email', ''))

        if today in days and email:
            ulist.append(uid)
            mails.append(email)

    logger.info(f"Found {len(ulist)} users scheduled for delivery today (weekday {today}).")
    if not ulist:
        return True

    # Cloud Firestore
    try:
        if not firebase_admin._apps:
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        db = firestore.client()
    except Exception as e:
        logger.error(f"Failed to initialize Firestore: {e}")
        return False

    for i in range(len(ulist)):
        uid = ulist[i]
        recipient = mails[i]
        uids_col = db.collection(uid)
        user_urls = uids_col.where('status', '==', 100).stream()

        urls = []
        for j in user_urls:
            doc_data = j.to_dict()
            u = doc_data.get('articleURL')
            if not u:
                continue

            try:
                if Article:
                    a = Article(u)
                    a.download()
                    a.parse()
                    if a.is_valid_body() or 'www.youtube.com' in u:
                        if u not in urls:
                            urls.append(u)
                        uids_col.document(j.id).update({'status': 101})
                    else:
                        uids_col.document(j.id).update({'status': 103})
                else:
                    urls.append(u)
                    uids_col.document(j.id).update({'status': 101})
            except Exception as ex:
                logger.warning(f"Error scraping {u}: {ex}")
                uids_col.document(j.id).update({'status': 103})

        if urls:
            logger.info(f"Dispatching {len(urls)} items to {recipient}...")
            npdf.generate_pdf(urls)
            html = nhtml.generate_html(urls)
            nmail.send(html, recipient)

    return True


def main():
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
    run_firebase_worker()


if __name__ == "__main__":
    main()
