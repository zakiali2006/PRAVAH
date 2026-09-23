import uuid
from typing import Dict, Any


class PaymentAdapter:
    """
    Stub interface for payment gateway integration.
    In development, this mocks a successful payment response.
    """

    def process_payment(self, application_id: str, amount: float) -> Dict[str, Any]:
        # In a real implementation, this would make HTTP calls to Razorpay/Stripe/etc.
        return {
            "status": "completed",
            "reference_id": f"txn_{uuid.uuid4().hex[:12]}",
            "amount": amount,
        }


payment_adapter = PaymentAdapter()
