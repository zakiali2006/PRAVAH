import os
import firebase_admin
from firebase_admin import credentials, firestore
from app.core.config import settings

def init_firebase():
    """Initializes Firebase Admin SDK if not already initialized"""
    if not firebase_admin._apps:
        # Check if the credentials file exists
        if os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
            cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
            firebase_admin.initialize_app(cred)
            print("Firebase Admin SDK initialized successfully.")
        else:
            print(f"WARNING: Firebase credentials not found at {settings.FIREBASE_CREDENTIALS_PATH}")
            print("Firebase features will fail until you provide the service account JSON key.")

def get_db():
    """Returns a Firestore client instance"""
    init_firebase()
    if firebase_admin._apps:
        return firestore.client()
    return None
