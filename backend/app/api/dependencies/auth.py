from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth
from app.core.firebase import get_db

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verifies the Firebase JWT token and returns the user object and their Firestore profile data.
    """
    token = credentials.credentials
    try:
        # Verify the Firebase JWT
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token.get("uid")
        
        if not uid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
            )
            
        # Fetch the user's business profile from Firestore
        db = get_db()
        user_doc = db.collection('users').document(uid).get()
        
        if not user_doc.exists:
            # Fallback if profile isn't created yet but auth is valid
            return {"uid": uid, "email": decoded_token.get("email"), "business_name": "Unknown Business"}
            
        user_data = user_doc.to_dict()
        user_data["uid"] = uid
        return user_data

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token or authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
