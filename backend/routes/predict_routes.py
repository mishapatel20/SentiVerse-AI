import json
import csv
import io
from flask import Blueprint, request, jsonify
from auth import jwt_required
from database import get_db_connection, log_activity
from ml.pipeline import get_pipeline

predict_bp = Blueprint('predict', __name__, url_prefix='/api')

@predict_bp.route('/predict', methods=['POST'])
@jwt_required
def predict_single():
    data = request.get_json() or {}
    review_text = data.get('review_text', '').strip()

    if not review_text:
        return jsonify({'error': 'Review text cannot be empty.'}), 400

    pipeline = get_pipeline()
    result = pipeline.analyze_review(review_text)

    # Save to database
    user_id = request.current_user['id']
    conn = get_db_connection()
    cursor = conn.cursor()
    
    recs_str = "\n".join(result.get('recommendations', []))
    
    cursor.execute('''
        INSERT INTO predictions (
            user_id, review_text, clean_text, sentiment, confidence,
            probability_json, aspects_json, emotions_json, is_fake, fake_score,
            language, translated_text, recommendation, inference_time_ms
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        user_id,
        result['review_text'],
        result['clean_text'],
        result['sentiment'],
        result['confidence'],
        json.dumps(result['probability']),
        json.dumps(result['aspects']),
        json.dumps(result['emotions']),
        1 if result['fake_detection']['is_fake'] else 0,
        result['fake_detection']['score'],
        result['language']['language_code'],
        result['language']['translated_text'],
        recs_str,
        result['inference_time_ms']
    ))
    
    prediction_id = cursor.lastrowid
    conn.commit()
    conn.close()

    result['id'] = prediction_id
    log_activity(user_id, 'SINGLE_PREDICTION', f"Predicted sentiment '{result['sentiment']}' with confidence {result['confidence']}%.")

    return jsonify(result), 200

@predict_bp.route('/predict/bulk', methods=['POST'])
@jwt_required
def predict_bulk():
    user_id = request.current_user['id']

    # Case 1: CSV file upload
    if 'file' in request.files:
        file = request.files['file']
        filename = file.filename or 'uploaded_reviews.csv'
        text_content = file.stream.read().decode('utf-8', errors='ignore')
        
        csv_reader = csv.reader(io.StringIO(text_content))
        rows = list(csv_reader)
        
        if not rows:
            return jsonify({'error': 'CSV file is empty.'}), 400

        # Try to identify review text column
        header = rows[0]
        review_col_idx = 0
        
        # Look for headers containing 'review', 'text', 'comment', 'content'
        for idx, col in enumerate(header):
            col_lower = str(col).lower()
            if any(k in col_lower for k in ['review', 'text', 'comment', 'content', 'feedback', 'summary']):
                review_col_idx = idx
                break

        reviews_list = []
        start_row = 1 if len(rows) > 1 and any(c in str(header[0]).lower() for c in ['review', 'text', 'id', 'rating']) else 0
        
        for row in rows[start_row:]:
            if row and len(row) > review_col_idx:
                txt = row[review_col_idx].strip()
                if len(txt) > 3:
                    reviews_list.append(txt)

    # Case 2: JSON payload with array of texts
    else:
        data = request.get_json() or {}
        reviews_list = data.get('reviews', [])
        filename = data.get('filename', 'bulk_dataset.csv')

    if not reviews_list:
        return jsonify({'error': 'No valid reviews found to process.'}), 400

    pipeline = get_pipeline()
    analyzed_results = []
    
    pos_cnt = 0
    neg_cnt = 0
    neu_cnt = 0

    conn = get_db_connection()
    cursor = conn.cursor()

    for txt in reviews_list[:500]: # Limit to 500 max per batch for safety
        res = pipeline.analyze_review(txt)
        analyzed_results.append(res)

        sent = res['sentiment']
        if sent == 'positive':
            pos_cnt += 1
        elif sent == 'negative':
            neg_cnt += 1
        else:
            neu_cnt += 1

        recs_str = "\n".join(res.get('recommendations', []))
        
        cursor.execute('''
            INSERT INTO predictions (
                user_id, review_text, clean_text, sentiment, confidence,
                probability_json, aspects_json, emotions_json, is_fake, fake_score,
                language, translated_text, recommendation, inference_time_ms
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id,
            res['review_text'],
            res['clean_text'],
            res['sentiment'],
            res['confidence'],
            json.dumps(res['probability']),
            json.dumps(res['aspects']),
            json.dumps(res['emotions']),
            1 if res['fake_detection']['is_fake'] else 0,
            res['fake_detection']['score'],
            res['language']['language_code'],
            res['language']['translated_text'],
            recs_str,
            res['inference_time_ms']
        ))

    # Generate Executive Bulk AI Summary
    total_reviews = len(analyzed_results)
    pos_pct = round((pos_cnt / total_reviews) * 100, 1) if total_reviews else 0
    neg_pct = round((neg_cnt / total_reviews) * 100, 1) if total_reviews else 0

    ai_summary = f"Batch Analysis of {total_reviews} reviews: {pos_pct}% Positive, {neg_pct}% Negative. "
    if pos_pct >= 60:
        ai_summary += "Overall product sentiment is strongly favorable. Customers praise build quality and speed."
    elif neg_pct >= 40:
        ai_summary += "Critical product concerns detected! High volume of negative feedback regarding battery drain and delivery packaging."
    else:
        ai_summary += "Product sentiment is balanced with moderate customer satisfaction."

    # Save Uploaded File Record
    cursor.execute('''
        INSERT INTO uploaded_files (
            user_id, filename, row_count, positive_count, negative_count, neutral_count, ai_summary
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (user_id, filename, total_reviews, pos_cnt, neg_cnt, neu_cnt, ai_summary))

    conn.commit()
    conn.close()

    log_activity(user_id, 'BULK_PREDICTION', f"Analyzed {total_reviews} reviews from file '{filename}'.")

    return jsonify({
        'message': f"Successfully processed {total_reviews} reviews.",
        'total_reviews': total_reviews,
        'summary': {
            'positive_count': pos_cnt,
            'negative_count': neg_cnt,
            'neutral_count': neu_cnt,
            'ai_summary': ai_summary
        },
        'results': analyzed_results
    }), 200
