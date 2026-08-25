import sqlite3
import json
from datetime import datetime
from config import Config
from werkzeug.security import generate_password_hash

def get_db_connection():
    conn = sqlite3.connect(Config.DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            avatar_url TEXT DEFAULT '',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Predictions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            review_text TEXT NOT NULL,
            clean_text TEXT NOT NULL,
            sentiment TEXT NOT NULL,
            confidence REAL NOT NULL,
            probability_json TEXT NOT NULL,
            aspects_json TEXT NOT NULL,
            emotions_json TEXT NOT NULL,
            is_fake INTEGER DEFAULT 0,
            fake_score REAL DEFAULT 0.0,
            language TEXT DEFAULT 'en',
            translated_text TEXT DEFAULT '',
            recommendation TEXT DEFAULT '',
            inference_time_ms REAL DEFAULT 0.0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    ''')

    # UploadedFiles table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS uploaded_files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            filename TEXT NOT NULL,
            row_count INTEGER NOT NULL,
            positive_count INTEGER DEFAULT 0,
            negative_count INTEGER DEFAULT 0,
            neutral_count INTEGER DEFAULT 0,
            ai_summary TEXT DEFAULT '',
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    ''')

    # ActivityLogs table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS activity_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            action TEXT NOT NULL,
            details TEXT DEFAULT '',
            ip_address TEXT DEFAULT '127.0.0.1',
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    ''')

    # Seed Default Admin User if not exists
    cursor.execute('SELECT * FROM users WHERE email = ?', ('admin@sentiverse.ai',))
    admin = cursor.fetchone()
    if not admin:
        hashed_pw = generate_password_hash('Admin123!')
        cursor.execute('''
            INSERT INTO users (email, password_hash, full_name, role)
            VALUES (?, ?, ?, ?)
        ''', ('admin@sentiverse.ai', hashed_pw, 'System Administrator', 'admin'))

    # Seed Default Demo User if not exists
    cursor.execute('SELECT * FROM users WHERE email = ?', ('demo@sentiverse.ai',))
    demo = cursor.fetchone()
    if not demo:
        hashed_pw = generate_password_hash('Demo123!')
        cursor.execute('''
            INSERT INTO users (email, password_hash, full_name, role)
            VALUES (?, ?, ?, ?)
        ''', ('demo@sentiverse.ai', hashed_pw, 'Demo Customer', 'user'))

    conn.commit()
    conn.close()

def log_activity(user_id, action, details='', ip_address='127.0.0.1'):
    try:
        conn = get_db_connection()
        conn.execute('''
            INSERT INTO activity_logs (user_id, action, details, ip_address)
            VALUES (?, ?, ?, ?)
        ''', (user_id, action, details, ip_address))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error logging activity: {e}")
