import json
from flask import Blueprint, request, jsonify
from auth import jwt_required
from database import get_db_connection, log_activity

history_bp = Blueprint('history', __name__, url_prefix='/api')

@history_bp.route('/history', methods=['GET'])
@jwt_required
def get_history():
    user_id = request.current_user['id']
    
    # Query params
    search = request.args.get('search', '').strip()
    sentiment = request.args.get('sentiment', '').strip().lower()
    sort_by = request.args.get('sort_by', 'created_at') # 'created_at', 'confidence', 'sentiment'
    sort_order = request.args.get('sort_order', 'desc').lower()
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 15))
    offset = (page - 1) * limit

    conn = get_db_connection()
    
    query = 'SELECT * FROM predictions WHERE user_id = ?'
    params = [user_id]

    if search:
        query += ' AND (review_text LIKE ? OR clean_text LIKE ?)'
        params.extend([f'%{search}%', f'%{search}%'])

    if sentiment in ['positive', 'negative', 'neutral']:
        query += ' AND sentiment = ?'
        params.append(sentiment)

    # Total count query
    count_query = f"SELECT COUNT(*) FROM ({query})"
    total_count = conn.execute(count_query, params).fetchone()[0]

    # Ordering
    valid_sort_cols = {'created_at': 'created_at', 'confidence': 'confidence', 'sentiment': 'sentiment', 'id': 'id'}
    order_col = valid_sort_cols.get(sort_by, 'created_at')
    direction = 'ASC' if sort_order == 'asc' else 'DESC'

    query += f' ORDER BY {order_col} {direction} LIMIT ? OFFSET ?'
    params.extend([limit, offset])

    rows = conn.execute(query, params).fetchall()
    conn.close()

    predictions = []
    for r in rows:
        item = dict(r)
        try:
            item['probability'] = json.loads(item['probability_json'])
        except Exception:
            item['probability'] = {}
        try:
            item['aspects'] = json.loads(item['aspects_json'])
        except Exception:
            item['aspects'] = {}
        try:
            item['emotions'] = json.loads(item['emotions_json'])
        except Exception:
            item['emotions'] = {}

        del item['probability_json']
        del item['aspects_json']
        del item['emotions_json']
        predictions.append(item)

    return jsonify({
        'predictions': predictions,
        'pagination': {
            'total': total_count,
            'page': page,
            'limit': limit,
            'total_pages': (total_count + limit - 1) // limit if limit else 1
        }
    }), 200

@history_bp.route('/history/<int:pred_id>', methods=['DELETE'])
@jwt_required
def delete_prediction(pred_id):
    user_id = request.current_user['id']
    conn = get_db_connection()
    
    pred = conn.execute('SELECT id FROM predictions WHERE id = ? AND user_id = ?', (pred_id, user_id)).fetchone()
    if not pred:
        conn.close()
        return jsonify({'error': 'Prediction record not found or access denied.'}), 404

    conn.execute('DELETE FROM predictions WHERE id = ?', (pred_id,))
    conn.commit()
    conn.close()

    log_activity(user_id, 'DELETE_PREDICTION', f"Deleted prediction ID {pred_id}.")
    return jsonify({'message': 'Prediction record deleted successfully.'}), 200

@history_bp.route('/history/clear', methods=['DELETE'])
@jwt_required
def clear_history():
    user_id = request.current_user['id']
    conn = get_db_connection()
    conn.execute('DELETE FROM predictions WHERE user_id = ?', (user_id,))
    conn.commit()
    conn.close()

    log_activity(user_id, 'CLEAR_HISTORY', "Cleared all personal prediction history.")
    return jsonify({'message': 'All prediction history cleared successfully.'}), 200
