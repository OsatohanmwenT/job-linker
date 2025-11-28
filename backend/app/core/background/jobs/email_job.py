# app/background/jobs/email_jobs.py
from datetime import datetime, timedelta, timezone

from app.core.background.inngest_client import inngest_client
from app.core.services.email import email_service
from app.db.database import SessionLocal
from app.models.application import JobListingApplication
from app.models.user import User
from inngest import TriggerCron


@inngest_client.create_function(
    fn_id="send-daily-application-emails",
    trigger=TriggerCron(cron="0 9 * * *"),  # Every day at 9 AM
)
async def send_daily_emails_job(ctx, step):
    db = SessionLocal()
    try:
        # Get applications from last 24 hours
        yesterday = datetime.now(timezone.utc) - timedelta(days=1)

        new_applications = (
            db.query(JobListingApplication)
            .filter(JobListingApplication.created_at >= yesterday)
            .all()
        )

        # Group by organization
        from collections import defaultdict

        org_applications = defaultdict(list)

        for app in new_applications:
            org_id = app.job_listing.organization_id
            org_applications[org_id].append(
                {
                    "user_name": app.user.name,
                    "job_title": app.job_listing.title,
                    "rating": app.rating or 0,
                }
            )

        # Send email to each organization admin
        for org_id, apps in org_applications.items():
            # Get org admins (simplified - you'd query OrganizationMembership)
            # For now, send to first admin
            admin = db.query(User).first()  # Replace with actual admin query

            if admin:
                await step.run(
                    f"send-email-{org_id}",
                    email_service.send_daily_applications_summary,
                    admin.email,
                    admin.name,
                    apps,
                )

        return {"success": True, "emails_sent": len(org_applications)}

    finally:
        db.close()
