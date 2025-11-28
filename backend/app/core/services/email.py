# app/services/email.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List
from app.config import settings

class EmailService:
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.EMAIL_FROM
        self.from_name = settings.EMAIL_FROM_NAME
    
    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: str = None
    ):
        """Send an email using SMTP"""
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{self.from_name} <{self.from_email}>"
        msg["To"] = to_email
        
        # Add text and HTML parts
        if text_content:
            part1 = MIMEText(text_content, "plain")
            msg.attach(part1)
        
        part2 = MIMEText(html_content, "html")
        msg.attach(part2)
        
        # Send email
        try:
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
                print(f"Email sent to {to_email}")
        except Exception as e:
            print(f"Failed to send email: {e}")
            raise
    
    def send_daily_applications_summary(
        self,
        to_email: str,
        user_name: str,
        applications: List[dict]
    ):
        """Send daily summary of new applications"""
        subject = f"New Applications - {len(applications)} candidates"
        
        # Build HTML content
        html_content = f"""
        <html>
          <body style="font-family: Arial, sans-serif;">
            <h1>Hi {user_name}! 👋</h1>
            <p>You have <strong>{len(applications)}</strong> new applications today.</p>
            
            <h2>Top Matches:</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="background-color: #f2f2f2;">
                <th style="padding: 12px; text-align: left;">Candidate</th>
                <th style="padding: 12px; text-align: left;">Job</th>
                <th style="padding: 12px; text-align: center;">Match Score</th>
              </tr>
        """
        
        for app in applications[:10]:  # Top 10
            match_color = "green" if app["rating"] >= 90 else "blue" if app["rating"] >= 75 else "orange"
            html_content += f"""
              <tr style="border-bottom: 1px solid #ddd;">
                <td style="padding: 12px;">{app["user_name"]}</td>
                <td style="padding: 12px;">{app["job_title"]}</td>
                <td style="padding: 12px; text-align: center;">
                  <span style="background-color: {match_color}; color: white; padding: 4px 8px; border-radius: 4px;">
                    {app["rating"]}%
                  </span>
                </td>
              </tr>
            """
        
        html_content += """
            </table>
            <br>
            <a href="https://joblinker.com/employer/applications" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              View All Applications
            </a>
          </body>
        </html>
        """
        
        self.send_email(to_email, subject, html_content)

email_service = EmailService()