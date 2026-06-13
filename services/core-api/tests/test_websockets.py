from fastapi.testclient import TestClient
from app.main import app

def test_websocket_connection():
    with TestClient(app) as client:
        with client.websocket_connect("/ws/crowd-updates") as websocket:
            # We connected successfully, no exception thrown
            # We just close it
            websocket.close()
