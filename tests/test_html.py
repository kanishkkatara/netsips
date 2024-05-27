"""Tests for HTML newsletter generation and summarization."""
import unittest
import backend.netsips_v4.netsips_html as nhtml


class TestHTML(unittest.TestCase):
    def test_sumary_fallback(self):
        text = (
            "Local-first software is a set of principles for software architecture. "
            "It gives users ownership of their data by storing it locally. "
            "Syncing happens asynchronously in the background. "
            "Users can read and write anytime without an active internet connection."
        )
        summary = nhtml.sumary(text)
        self.assertIn("‣", summary)
        self.assertIn("Local-first software", summary)

    def test_generate_html_output_structure(self):
        urls = ["https://example.com/demo1", "https://example.com/demo2"]
        html = nhtml.generate_html(urls)
        self.assertIn("NETSIPS DIGEST", html)
        self.assertIn("https://example.com/demo1", html)
        self.assertIn("https://example.com/demo2", html)
        self.assertIn("2 articles", html)


if __name__ == "__main__":
    unittest.main()
