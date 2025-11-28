"""
Migration script to add ai_analysis column to job_listing_applications table
Run this script to update your database schema
"""

import sqlite3
import sys
from pathlib import Path

# Add the backend directory to the path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))


def migrate_database():
    """Add ai_analysis column if it doesn't exist"""
    db_path = backend_dir / "app.db"

    if not db_path.exists():
        print(f"❌ Database not found at: {db_path}")
        return False

    conn = None
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Check if column already exists
        cursor.execute("PRAGMA table_info(job_listing_applications)")
        columns = [column[1] for column in cursor.fetchall()]

        if "ai_analysis" in columns:
            print("✅ Column 'ai_analysis' already exists. No migration needed.")
            return True

        print("🔄 Adding 'ai_analysis' column to job_listing_applications table...")

        # Add the column
        cursor.execute(
            """
            ALTER TABLE job_listing_applications 
            ADD COLUMN ai_analysis TEXT
        """
        )

        conn.commit()
        print("✅ Migration completed successfully!")
        print("   - Added 'ai_analysis' column to job_listing_applications")

        return True

    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False
    finally:
        if conn:
            conn.close()


if __name__ == "__main__":
    print("=" * 60)
    print("  Database Migration: Add ai_analysis Column")
    print("=" * 60)
    print()

    success = migrate_database()

    print()
    print("=" * 60)
    if success:
        print("  ✨ Migration completed!")
    else:
        print("  ❌ Migration failed!")
    print("=" * 60)

    sys.exit(0 if success else 1)
