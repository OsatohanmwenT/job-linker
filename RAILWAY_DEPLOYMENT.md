# Railway Deployment Guide for JobLinker Backend

## Prerequisites

1. Railway account (sign up at https://railway.app)
2. Railway CLI (optional): `npm install -g @railway/cli`
3. GitHub repository connected to Railway

## Deployment Steps

### Option 1: Deploy via Railway Dashboard (Recommended for Monorepos)

1. **Create New Project**
   - Go to https://railway.app/new
   - Click "Deploy from GitHub repo"
   - Select your `job-linker` repository

2. **Configure Service for Backend**
   - Click "Add a service"
   - Select "GitHub Repo"
   - Choose your repository
   - Railway will detect the monorepo structure

3. **Set Root Directory**
   - In service settings, go to "Settings" tab
   - Set **Root Directory** to: `backend`
   - This tells Railway to build from the backend folder

4. **Add PostgreSQL Database**
   - Click "+ New" in your project
   - Select "Database" → "Add PostgreSQL"
   - Railway will automatically provision a PostgreSQL instance
   - The `DATABASE_URL` will be automatically injected as an environment variable

5. **Configure Environment Variables**
   
   Go to your backend service → "Variables" tab and add:

   ```
   # Database (automatically provided by Railway when you add PostgreSQL)
   DATABASE_URL=${DATABASE_URL}  # Auto-injected by Railway
   
   # JWT Configuration
   JWT_SECRET_KEY=<your-secure-random-key-min-32-chars>
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=15
   REFRESH_TOKEN_EXPIRE_DAYS=7
   
   # AI Services
   GEMINI_API_KEY=<your-google-gemini-api-key>
   
   # Inngest
   INNGEST_EVENT_KEY=<your-inngest-event-key>
   INNGEST_SIGNING_KEY=<your-inngest-signing-key>
   INNGEST_BASE_URL=<optional-if-using-inngest-cloud>
   
   # CORS (add your frontend URL after deployment)
   CORS_ORIGINS=["https://your-frontend-domain.vercel.app","http://localhost:3000"]
   
   # Python environment
   PYTHONUNBUFFERED=1
   PORT=8000
   ```

6. **Deploy**
   - Railway will automatically deploy after configuration
   - Monitor deployment in the "Deployments" tab
   - You'll get a public URL like: `https://joblinker-backend-production.up.railway.app`

### Option 2: Deploy via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Navigate to backend directory
cd backend

# Initialize Railway project (first time only)
railway init

# Link to existing project (if already created in dashboard)
railway link

# Set environment variables
railway variables set JWT_SECRET_KEY="your-secret-key"
railway variables set GEMINI_API_KEY="your-gemini-key"
# ... set other variables

# Deploy
railway up
```

### Option 3: Deploy with Dockerfile

Railway automatically detects and uses the `Dockerfile` if present in the root directory (backend folder).

The provided Dockerfile:
- Uses Python 3.11
- Installs system dependencies
- Installs Python packages from requirements.txt
- Exposes port from Railway's PORT environment variable
- Runs uvicorn with proper host and port configuration

## Post-Deployment Configuration

### 1. Update CORS Origins

After deploying frontend, update the backend's CORS_ORIGINS:

```bash
# In Railway dashboard → Variables
CORS_ORIGINS=["https://your-frontend.vercel.app","https://your-custom-domain.com"]
```

### 2. Configure Custom Domain (Optional)

- Go to backend service → "Settings" → "Domains"
- Click "Generate Domain" for a Railway domain
- Or add your custom domain and configure DNS

### 3. Database Migrations

Railway doesn't run migrations automatically. You can:

**Option A: Use Railway's Run Command**
```bash
# Via CLI
railway run python migrate_add_ai_analysis.py
```

**Option B: Add migration to start command**

Edit `railway.json` or `Procfile`:
```json
{
  "deploy": {
    "startCommand": "python app/db/database.py && uvicorn app.main:app --host 0.0.0.0 --port $PORT"
  }
}
```

### 4. Monitor Logs

```bash
# Via CLI
railway logs

# Or view in Railway dashboard → Deployments → Logs
```

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection (auto-injected) | `postgresql://...` |
| `JWT_SECRET_KEY` | Yes | Secret for JWT signing (min 32 chars) | Random string |
| `GEMINI_API_KEY` | Yes | Google AI API key | `AIza...` |
| `INNGEST_EVENT_KEY` | Yes | Inngest event key | From Inngest dashboard |
| `INNGEST_SIGNING_KEY` | Yes | Inngest signing key | From Inngest dashboard |
| `CORS_ORIGINS` | Yes | Allowed frontend origins | JSON array |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | JWT expiry (default: 15) | `15` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | No | Refresh token expiry (default: 7) | `7` |
| `PORT` | No | Server port (auto-injected by Railway) | `8000` |

## Important Configuration Updates

### Update config.py for Production

The current `config.py` has good defaults but ensure these are set via environment variables:

```python
# In production, these should come from environment variables:
DATABASE_URL=<from-railway-postgres>  # Not sqlite
JWT_SECRET_KEY=<strong-random-key>   # Not the dev default
CORS_ORIGINS=<your-frontend-urls>    # Not localhost
```

### Update main.py CORS Configuration

Update `backend/app/main.py` to read CORS from config:

```python
from app.config import settings

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,  # Uses config
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Troubleshooting

### Build Failures

**Issue**: `ModuleNotFoundError`
- Check `requirements.txt` has all dependencies
- Verify Python version in `runtime.txt` or Dockerfile

**Issue**: `Database connection failed`
- Ensure PostgreSQL is added to your Railway project
- Check `DATABASE_URL` is correctly set
- Verify database is in same Railway project

### Runtime Errors

**Issue**: `Port already in use`
- Ensure using `$PORT` environment variable
- Railway injects PORT automatically

**Issue**: `CORS errors`
- Add frontend URL to `CORS_ORIGINS`
- Include protocol (https://)
- Array format for multiple origins

### Database Issues

**Issue**: `relation does not exist`
- Run database migrations
- Ensure `init_db()` is called in startup

## Monitoring & Maintenance

### Health Checks

Railway automatically monitors your service. You can add a health endpoint:

```python
@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": settings.VERSION}
```

### Logs

- View in Railway dashboard
- Use `railway logs` via CLI
- Set up log alerts in Railway settings

### Scaling

- Railway automatically scales based on usage
- Configure resources in "Settings" → "Resources"
- Set up autoscaling in "Settings" → "Autoscaling"

## Cost Considerations

Railway pricing (as of 2024):
- **Hobby Plan**: $5/month includes:
  - $5 usage credit
  - 512MB RAM, 1 vCPU per service
  - PostgreSQL included

- **Pro Plan**: $20/month includes:
  - $20 usage credit
  - More resources and team features

Estimated monthly cost for JobLinker backend:
- Small service: ~$5-10/month
- PostgreSQL: Included
- Bandwidth: Usually within free tier

## Next Steps

1. ✅ Deploy backend to Railway
2. ⏭️ Deploy frontend to Vercel
3. 🔗 Update frontend with Railway backend URL
4. 🔐 Configure environment variables
5. 🧪 Test API endpoints
6. 📊 Set up monitoring and alerts
7. 🔒 Add custom domain with SSL

## Useful Links

- Railway Dashboard: https://railway.app/dashboard
- Railway Docs: https://docs.railway.app
- Python Template: https://github.com/railwayapp-templates/python-fastapi
- Inngest Setup: https://www.inngest.com/docs
- Gemini API: https://ai.google.dev/
