# Next Steps: Deploy to Railway with PostgreSQL

## 🎯 What Was Fixed

1. **Database Configuration** - Updated `app/db/database.py` to handle both SQLite (local) and PostgreSQL (production) with proper connection pooling
2. **Seed Script** - Created `seed_database.py` to populate database with sample data
3. **Documentation** - Created comprehensive guides for Railway PostgreSQL setup

## 🚀 Deploy to Railway (Follow These Steps)

### Step 1: Add PostgreSQL to Railway

1. Go to: https://railway.app/dashboard
2. Select your backend project
3. Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
4. Railway will automatically:
   - Create a PostgreSQL instance
   - Inject the `DATABASE_URL` environment variable
   - Link it to your backend service

### Step 2: Verify Environment Variables

In your Railway backend service, go to **Variables** tab and ensure:

```
DATABASE_URL = <automatically set by Railway>
JWT_SECRET_KEY = <your-secure-secret-key>
GEMINI_API_KEY = <your-gemini-api-key>
INNGEST_EVENT_KEY = <your-inngest-event-key>
INNGEST_SIGNING_KEY = <your-inngest-signing-key>
CORS_ORIGINS = ["http://localhost:3000"]
```

**Important:** Do NOT manually add/edit `DATABASE_URL` - Railway manages this automatically!

### Step 3: Push Changes to Deploy

```powershell
git add .
git commit -m "Add PostgreSQL configuration and seeding script"
git push
```

Railway will automatically:
- Detect the push
- Build your backend
- Connect to PostgreSQL
- Create all database tables
- Start the application

### Step 4: Check Deployment Logs

Monitor Railway logs for:
- ✅ "Creating database tables..."
- ✅ "Application startup complete"
- ✅ "Uvicorn running on..."
- ❌ No "password authentication failed" errors

### Step 5: Seed the Database

Once deployment is successful, seed your database with sample data.

#### Option A: Seed from Your Local Machine (Recommended)

1. In Railway dashboard, go to PostgreSQL service
2. Click **"Connect"** tab
3. Copy the **"Postgres Connection URL"**
4. Create `backend/.env` file locally:
   ```
   DATABASE_URL=postgresql://postgres:[password]@[host]:[port]/railway
   ```
5. Run seed script:
   ```powershell
   cd backend
   python seed_database.py
   ```

#### Option B: Seed via Railway CLI

```powershell
# Install CLI (if not installed)
npm install -g @railway/cli

# Login and link
railway login
cd backend
railway link

# Run seed script
railway run python seed_database.py
```

### Step 6: Test Your Application

1. Get your Railway backend URL (e.g., `https://your-backend.up.railway.app`)
2. Test the health endpoint: `https://your-backend.up.railway.app/health`
3. Test login with seeded credentials:
   - POST `https://your-backend.up.railway.app/api/v1/auth/login`
   - Body: `{"email": "employer1@example.com", "password": "Password123!"}`

## 📊 Sample Data Created

After seeding, you'll have:

### Users (5)
- **Employers:**
  - employer1@example.com / Password123!
  - employer2@example.com / Password123!
- **Job Seekers:**
  - jobseeker1@example.com / Password123!
  - jobseeker2@example.com / Password123!
  - jobseeker3@example.com / Password123!

### Organizations (2)
- TechCorp Inc (owned by employer1)
- DataSystems LLC (owned by employer2)

### Job Listings (5)
- Senior Full Stack Developer @ TechCorp ($150k/year, Hybrid, SF)
- Frontend Engineer @ TechCorp ($120k/year, Remote)
- Data Engineer @ DataSystems ($140k/year, In-Office, NY)
- Junior Software Developer @ DataSystems ($75k/year, Hybrid, NY)
- DevOps Engineer @ TechCorp ($135k/year, Remote)

### Candidates (3)
- Charlie Brown (Full Stack Developer, 3 years)
- Diana Prince (Data Analyst, 2 years)
- Ethan Hunt (Junior Developer, 0 years)

### Skills (20+)
Python, JavaScript, TypeScript, React, Node.js, FastAPI, PostgreSQL, etc.

## 🔍 Verify Database

You can verify the data in Railway:
1. Go to PostgreSQL service
2. Click **"Data"** tab
3. Browse tables: users, organizations, job_listings, candidates, skills

## 🐛 Troubleshooting

### Error: "password authentication failed for user postgres"

**Cause:** DATABASE_URL is incorrect or not set

**Solution:**
1. Delete any manually added DATABASE_URL variable in Railway
2. Ensure PostgreSQL service is linked to backend service
3. Railway will automatically inject the correct DATABASE_URL
4. Redeploy backend

### Tables Not Created

**Cause:** init_db() didn't run

**Solution:**
1. Check Railway logs for errors during startup
2. Verify all models are imported in `app/models/__init__.py`
3. Check that `lifespan` function in `app/main.py` calls `init_db()`

### Connection Pool Errors

**Solution:** The updated `database.py` includes:
- `pool_size=5`
- `max_overflow=10`
- `pool_pre_ping=True` (verifies connections before use)

## ✅ Success Checklist

- [ ] PostgreSQL added to Railway project
- [ ] DATABASE_URL automatically injected
- [ ] All environment variables set
- [ ] Code pushed to trigger deployment
- [ ] Deployment successful (check logs)
- [ ] Database seeded with sample data
- [ ] Health endpoint returns 200
- [ ] Can login with test credentials
- [ ] Frontend CORS_ORIGINS updated (once frontend deployed)

## 📝 Next Steps After Database Setup

1. **Deploy Frontend to Vercel**
2. **Update CORS_ORIGINS** with frontend URL
3. **Test end-to-end** (login, create jobs, apply, etc.)
4. **Set up monitoring** (Railway metrics, error tracking)
5. **Production hardening** (stronger passwords, rate limiting, etc.)

---

**Need Help?** 
- Railway Logs: `railway logs --service backend`
- Check: `RAILWAY_POSTGRES_SETUP.md` for detailed guide
- Run locally: `python seed_database.py` to test script
