from app.core.firebase import get_db
from app.services.data_service import (
    STATS, SERVICE_GROUPS, TALUKA_CAT, SECTORS, 
    TRACK_STAGES, SECTOR_INVEST, MONTHLY, REGION_SPLIT
)

def run_seed():
    db = get_db()
    if not db:
        print("Firebase not initialized. Add firebase-credentials.json to .env")
        return

    print("Seeding Firestore with PRAVAH mock data...")

    # We will store configuration-like data in a 'pravah_config' collection
    config_ref = db.collection("pravah_config")

    config_ref.document("stats").set({"data": STATS})
    config_ref.document("service_groups").set({"data": SERVICE_GROUPS})
    config_ref.document("taluka_cat").set({"data": TALUKA_CAT})
    config_ref.document("sectors").set({"data": SECTORS})
    config_ref.document("track_stages").set({"data": TRACK_STAGES})
    config_ref.document("sector_invest").set({"data": SECTOR_INVEST})
    config_ref.document("monthly").set({"data": MONTHLY})
    config_ref.document("region_split").set({"data": REGION_SPLIT})

    print("Successfully seeded Firestore!")

if __name__ == "__main__":
    run_seed()
