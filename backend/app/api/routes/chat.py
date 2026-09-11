from fastapi import APIRouter
from app.models.schemas import ChatRequest

router = APIRouter()

@router.post("/")
def chat_assistant(request: ChatRequest):
    """
    Accepts the user's chatbot prompt and returns an AI-generated assistant reply.
    Phase 18: AI Query Assistant
    """
    # Simple mock response for now
    lower_msg = request.message.lower()
    
    if "eligible" in lower_msg or "subsidy" in lower_msg:
        response = "To check your eligibility for subsidies, please use the Incentive Calculator under the Services tab."
    elif "status" in lower_msg or "track" in lower_msg:
        response = "You can track your application status by entering your Application ID in the 'Track Application' section on your dashboard."
    else:
        response = "I'm the MAITRI AI Assistant. How can I help you with your business approvals today?"
        
    return {
        "reply": response
    }
