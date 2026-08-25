import jwt
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import request, jsonify
from config import Config
from database import get_db_connection

def generate_token(user_id, role, email, name):
    payload = {
        'user_id': user_id,
        'role': role,
        'email': email,
        'name': name,
        'exp': datetime.now(timezone.utc) + timedelta(hours=Config.JWT_EXPIRATION_HOURS)
    }
    token = jwt.encode(payload, Config.SECRET_KEY, algorithm='HS256')
    return token

def decode_token(token):
    try:
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def jwt_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

        if not token:
            return jsonify({'error': 'Authentication token is missing'}), 401

        payload = decode_token(token)
        if not payload:
            return jsonify({'error': 'Token is invalid or expired'}), 401

        # Check if user exists
        conn = get_db_connection()
        user = conn.execute('SELECT id, email, full_name, role, avatar_url FROM users WHERE id = ?', (payload['user_id'],)).fetchone()
        conn.close()

        if not user:
            return jsonify({'error': 'User associated with token not found'}), 401

        request.current_user = dict(user)
        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not hasattr(request, 'current_user') or request.current_user.get('role') != 'admin':
            return jsonify({'error': 'Admin privilege required for this resource'}), 403
        return f(*args, **kwargs)
    return decorated
