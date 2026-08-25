from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db_connection, log_activity
from auth import generate_token, jwt_required

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()
    full_name = data.get('full_name', '').strip()

    if not email or not password or not full_name:
        return jsonify({'error': 'All fields (email, password, full_name) are required.'}), 400

    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters long.'}), 400

    conn = get_db_connection()
    existing_user = conn.execute('SELECT id FROM users WHERE email = ?', (email,)).fetchone()
    if existing_user:
        conn.close()
        return jsonify({'error': 'An account with this email already exists.'}), 409

    hashed_pw = generate_password_hash(password)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO users (email, password_hash, full_name, role)
        VALUES (?, ?, ?, ?)
    ''', (email, hashed_pw, full_name, 'user'))
    conn.commit()
    new_user_id = cursor.lastrowid
    conn.close()

    log_activity(new_user_id, 'USER_REGISTER', f"User {email} registered successfully.")
    token = generate_token(new_user_id, 'user', email, full_name)

    return jsonify({
        'message': 'Registration successful',
        'token': token,
        'user': {
            'id': new_user_id,
            'email': email,
            'full_name': full_name,
            'role': 'user',
            'avatar_url': ''
        }
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '').strip()

    if not email or not password:
        return jsonify({'error': 'Email and password are required.'}), 400

    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE email = ?', (email,)).fetchone()
    conn.close()

    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'error': 'Invalid email or password.'}), 401

    token = generate_token(user['id'], user['role'], user['email'], user['full_name'])
    log_activity(user['id'], 'USER_LOGIN', f"User {email} logged in.")

    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': {
            'id': user['id'],
            'email': user['email'],
            'full_name': user['full_name'],
            'role': user['role'],
            'avatar_url': user['avatar_url'] or ''
        }
    }), 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()

    if not email:
        return jsonify({'error': 'Email address is required.'}), 400

    conn = get_db_connection()
    user = conn.execute('SELECT id FROM users WHERE email = ?', (email,)).fetchone()
    conn.close()

    if user:
        log_activity(user['id'], 'FORGOT_PASSWORD_REQUEST', f"Password reset requested for {email}.")

    return jsonify({'message': 'If your email is registered, you will receive password reset instructions shortly.'}), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required
def get_current_user():
    return jsonify({'user': request.current_user}), 200

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required
def update_profile():
    data = request.get_json() or {}
    full_name = data.get('full_name', '').strip()
    avatar_url = data.get('avatar_url', '').strip()

    if not full_name:
        return jsonify({'error': 'Full name cannot be empty.'}), 400

    user_id = request.current_user['id']
    conn = get_db_connection()
    conn.execute('''
        UPDATE users SET full_name = ?, avatar_url = ? WHERE id = ?
    ''', (full_name, avatar_url, user_id))
    conn.commit()
    conn.close()

    log_activity(user_id, 'PROFILE_UPDATE', "Updated profile details.")
    return jsonify({'message': 'Profile updated successfully', 'full_name': full_name, 'avatar_url': avatar_url}), 200

@auth_bp.route('/change-password', methods=['PUT'])
@jwt_required
def change_password():
    data = request.get_json() or {}
    current_pw = data.get('current_password', '').strip()
    new_pw = data.get('new_password', '').strip()

    if not current_pw or not new_pw:
        return jsonify({'error': 'Both current and new passwords are required.'}), 400

    if len(new_pw) < 6:
        return jsonify({'error': 'New password must be at least 6 characters long.'}), 400

    user_id = request.current_user['id']
    conn = get_db_connection()
    user = conn.execute('SELECT password_hash FROM users WHERE id = ?', (user_id,)).fetchone()

    if not user or not check_password_hash(user['password_hash'], current_pw):
        conn.close()
        return jsonify({'error': 'Incorrect current password.'}), 400

    new_hash = generate_password_hash(new_pw)
    conn.execute('UPDATE users SET password_hash = ? WHERE id = ?', (new_hash, user_id))
    conn.commit()
    conn.close()

    log_activity(user_id, 'PASSWORD_CHANGE', "User changed their password.")
    return jsonify({'message': 'Password updated successfully.'}), 200
