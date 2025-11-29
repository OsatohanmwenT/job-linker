# Railway PostgreSQL Setup Guide

## Step 1: Add PostgreSQL to Your Railway Project

1. Go to your Railway project dashboard: https://railway.app/project/[your-project-id]
2. Click **"+ New"** button
3. Select **"Database"** → **"Add PostgreSQL"**
4. Railway will automatically create a PostgreSQL instance and inject the `DATABASE_URL` environment variable

## Step 2: Verify DATABASE_URL is Set

In your Railway backend service:
1. Go to **Variables** tab
2. You should see `DATABASE_URL` automatically added by Railway
3. The format should be: `postgresql://postgres:[password]@[host]:[port]/railway`

**IMPORTANT:** Do NOT manually edit the `DATABASE_URL` - Railway manages this automatically.

## Step 3: Update Backend Environment Variables

In Railway, ensure these variables are set:

```
DATABASE_URL=<automatically set by Railway>
JWT_SECRET_KEY=<your-secure-secret-key>
GEMINI_API_KEY=<your-gemini-api-key>
INNGEST_EVENT_KEY=<your-inngest-event-key>
INNGEST_SIGNING_KEY=<your-inngest-signing-key>
CORS_ORIGINS=["http://localhost:3000", "https://your-frontend-url.vercel.app"]
```

## Step 4: Deploy Backend

After adding PostgreSQL, Railway will automatically redeploy your backend with the correct `DATABASE_URL`.

The database tables will be created automatically via the `init_db()` call in `app/main.py` startup.

## Step 5: Seed the Database

You have two options to seed your database with sample data:

### Option A: Seed from Local Machine (Recommended)

1. Get the DATABASE_URL from Railway:
   - In Railway, go to PostgreSQL service
   - Click **"Connect"** tab
   - Copy the **"Postgres Connection URL"**

2. Create a `.env` file in the `backend` folder:
   ```
   DATABASE_URL=postgresql://postgres:[password]@[host]:[port]/railway
   ```

3. Run the seed script:
   ```powershell
   cd backend
   python seed_database.py
   ```

### Option B: Seed via Railway CLI

1. Install Railway CLI if you haven't:
   ```powershell
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```powershell
   railway login
   ```

3. Link to your project:
   ```powershell
   cd backend
   railway link
   ```

4. Run seed script using Railway environment:
   ```powershell
   railway run python seed_database.py
   ```

### Option C: Manual Seed from Railway Dashboard

1. Go to your backend service in Railway
2. Click on **"Logs"** tab
3. Open the deployment logs
4. Once the service is running, you can execute the seed script via a one-off command

## Step 6: Verify Database Connection

Check your Railway backend logs to ensure:
- ✅ No database connection errors
- ✅ Tables created successfully
- ✅ Application startup complete

## Troubleshooting

### "password authentication failed for user postgres"

**Cause:** The `DATABASE_URL` environment variable is incorrect or not set.

**Solution:**
1. In Railway, delete the backend service's `DATABASE_URL` variable if you manually added one
2. Ensure the PostgreSQL service is linked to your backend service
3. Railway should automatically inject the correct `DATABASE_URL`
4. Redeploy the backend service

### Tables Not Created

**Cause:** The database initialization didn't run.

**Solution:**
1. Check that `init_db()` is called in `app/main.py` lifespan
2. Verify all models are imported in `app/models/__init__.py`
3. Check Railway logs for any errors during startup

### Connection Pool Errors

**Cause:** Too many database connections.

**Solution:**
- The updated `database.py` now includes connection pooling settings
- Pool size: 5, Max overflow: 10
- Use `pool_pre_ping=True` to verify connections

## Sample Data Created

After seeding, you'll have:

### Users (5 total)
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
- Senior Full Stack Developer (TechCorp)
- Frontend Engineer (TechCorp)
- Data Engineer (DataSystems)
- Junior Software Developer (DataSystems)
- DevOps Engineer (TechCorp)

### Candidates (3)
- Charlie Brown (Full Stack Developer)
- Diana Prince (Data Analyst)
- Ethan Hunt (Junior Developer)

### Skills (20+)
- Python, JavaScript, TypeScript, React, Node.js, etc.

## Next Steps

1. Test login with sample credentials
2. Create job listings as employer
3. Apply to jobs as job seeker
4. Test AI resume parsing and candidate ranking
5. Update CORS_ORIGINS with your frontend URL once deployed

## Database Management

### View Data in Railway
- Go to PostgreSQL service → Data tab
- Browse tables and view data

### Backup Database
```powershell
railway run pg_dump > backup.sql
```

### Reset Database (CAUTION: Deletes all data)
```powershell
railway run python seed_database.py
```

## Production Best Practices

1. **Use strong passwords** for user accounts
2. **Set secure JWT_SECRET_KEY** (use a long random string)
3. **Enable SSL** for database connections (Railway does this automatically)
4. **Monitor connection pool** usage in Railway metrics
5. **Set up database backups** in Railway settings
6. **Use environment-specific CORS_ORIGINS**
