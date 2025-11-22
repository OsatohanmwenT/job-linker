from fastapi.testclient import TestClient
from main import app
from db.session import SessionLocal
from models.user import User

client = TestClient(app)

def verify_auth_flow():
    print("1. Cleaning up test user...")
    db = SessionLocal()
    user = db.query(User).filter(User.email == "test@example.com").first()
    if user:
        db.delete(user)
        db.commit()
    db.close()

    print("2. Testing Registration...")
    response = client.post(
        "/api/v1/users/",
        json={
            "email": "test@example.com",
            "password": "testpassword123",
            "full_name": "Test User",
            "role": "SEEKER"
        },
    )
    if response.status_code != 200:
        print(f"Registration failed: {response.text}")
        return
    print("Registration successful!")

    print("3. Testing Login...")
    response = client.post(
        "/api/v1/auth/login/access-token",
        data={
            "username": "test@example.com",
            "password": "testpassword123"
        },
    )
    if response.status_code != 200:
        print(f"Login failed: {response.text}")
        return
    token = response.json()["access_token"]
    print("Login successful! Token received.")

    print("4. Testing Protected Route (/users/me)...")
    response = client.get(
        "/api/v1/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    if response.status_code != 200:
        print(f"Protected route failed: {response.text}")
        return
    user_data = response.json()
    print(f"Protected route successful! User: {user_data['email']}")

if __name__ == "__main__":
    try:
        verify_auth_flow()
        print("\nVerification Complete: SUCCESS")
    except Exception as e:
        print(f"\nVerification Failed: {e}")
