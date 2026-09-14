from app.schemas.donor import DonorCreate

def test_donor_validation():
    d = DonorCreate(full_name="Test Donor", age=25, gender="Male", blood_group="O+", phone="9876543210", email="test@example.com", address="Test address", password="StrongPass123!")
    assert d.blood_group == "O+"
