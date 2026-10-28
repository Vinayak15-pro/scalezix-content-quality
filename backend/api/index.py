import os
import sys

# Ensure backend directory is in python path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
root_dir = os.path.dirname(parent_dir)

for path in [root_dir, parent_dir]:
    if path not in sys.path:
        sys.path.insert(0, path)

from backend.app.main import app

# Export app for Vercel serverless ASGI handler
app = app
