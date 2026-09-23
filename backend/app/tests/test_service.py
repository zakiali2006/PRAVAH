import pytest
from fastapi.testclient import TestClient
from app.tests.conftest import client, TestingSessionLocal
from app.models.service import Service
from app.models.rbac import Department
from app.models.document import DocumentType


@pytest.fixture(autouse=True)
def setup_service_db():
    db = TestingSessionLocal()

    # Create Departments
    dept_midc = Department(name="MIDC", code="MIDC")
    dept_mpcb = Department(name="MPCB", code="MPCB")
    db.add(dept_midc)
    db.add(dept_mpcb)
    db.commit()

    # Create Document Types
    doc1 = DocumentType(name="PAN Card")
    doc2 = DocumentType(name="GST Certificate")
    db.add(doc1)
    db.add(doc2)
    db.commit()

    # Create Services
    service1 = Service(
        name="Land Allotment",
        department_id=dept_midc.id,
        sector="Manufacturing",
        fee_amount=1000.0,
        processing_time_days=30,
    )
    service1.required_documents.extend([doc1, doc2])

    service2 = Service(
        name="Consent to Establish",
        department_id=dept_mpcb.id,
        sector="Chemical",
        fee_amount=5000.0,
        processing_time_days=45,
    )
    service2.required_documents.append(doc1)

    db.add(service1)
    db.add(service2)
    db.commit()
    db.close()


def test_list_services(client: TestClient):
    response = client.get("/api/services")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["data"]) == 2

    # Check included document types
    service1 = next(s for s in data["data"] if s["name"] == "Land Allotment")
    assert len(service1["required_documents"]) == 2
    assert service1["required_documents"][0]["name"] in ["PAN Card", "GST Certificate"]


def test_filter_services_by_department(client: TestClient):
    response = client.get("/api/services?department=MIDC")
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) == 1
    assert data[0]["name"] == "Land Allotment"


def test_filter_services_by_sector(client: TestClient):
    response = client.get("/api/services?sector=Chemical")
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) == 1
    assert data[0]["name"] == "Consent to Establish"


def test_get_service_by_id(client: TestClient):
    # First get all to find an ID
    list_resp = client.get("/api/services")
    service_id = list_resp.json()["data"][0]["id"]
    service_name = list_resp.json()["data"][0]["name"]

    response = client.get(f"/api/services/{service_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["data"]["name"] == service_name
    assert "required_documents" in data["data"]


def test_get_unknown_service(client: TestClient):
    response = client.get("/api/services/999999")
    assert response.status_code == 404
    data = response.json()
    assert data["error_code"] == "RESOURCE_NOT_FOUND"
