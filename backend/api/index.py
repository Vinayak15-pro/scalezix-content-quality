import os
import sys

# Ensure current directory and parent directory are on sys.path
api_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(api_dir)
root_dir = os.path.dirname(backend_dir)

for p in [api_dir, backend_dir, root_dir]:
    if p and p not in sys.path:
        sys.path.insert(0, p)

try:
    from app.main import app
except ModuleNotFoundError:
    from backend.app.main import app

# Export app for Vercel serverless ASGI handler
app = app
