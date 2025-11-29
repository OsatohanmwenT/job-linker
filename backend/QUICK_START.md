# Quick Start Commands

## Add PostgreSQL to Railway

1. **Via Railway Dashboard:**
   - Open: https://railway.app/dashboard
   - Select your project
   - Click "+ New" → "Database" → "Add PostgreSQL"
   - Railway automatically links it to your backend service

2. **Via Railway CLI:**
   ```powershell
   railway add --database postgresql
   ```

## Get Your Database URL

```powershell
railway variables --service postgresql
```

## Test Local Connection to Railway Database

1. Copy DATABASE_URL from Railway
2. Create `backend/.env`:
   ```
   DATABASE_URL=your_railway_postgres_url
   ```
3. Test connection:
   ```powershell
   cd backend
   python -c "from app.db.database import engine; print('✓ Connected:', engine.url)"
   ```

## Seed Database

```powershell
cd backend
python seed_database.py
```

## Verify Seeded Data

```powershell
cd backend
python -c "from app.db.database import SessionLocal; from app.models.user import User; db = SessionLocal(); print('Users:', db.query(User).count()); db.close()"
```

## Deploy to Railway

```powershell
git add .
git commit -m "Configure PostgreSQL with seeding script"
git push
```

Railway will automatically redeploy with the new database configuration.

## Check Logs

```powershell
railway logs --service backend
```

Look for:
- ✅ "Application startup complete"
- ✅ No database connection errors
- ✅ "Uvicorn running on..."
