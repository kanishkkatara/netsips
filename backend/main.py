"""
Netsips Backend Main Entrypoint
"""

import sys
import os

# Ensure repo root is on sys.path
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)

from backend.cli import main

if __name__ == "__main__":
    main()
