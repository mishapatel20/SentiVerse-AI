from flask import Blueprint, request, jsonify
from auth import jwt_required
from database import get_db_connection, log_activity

translate_bp = Blueprint('translate', __name__, url_prefix='/api')

SUPPORTED_LANGUAGES = {
    'en': 'English',
    'hi': 'Hindi',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'zh-CN': 'Chinese (Simplified)',
    'ar': 'Arabic',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'it': 'Italian',
    'nl': 'Dutch',
    'tr': 'Turkish',
    'pl': 'Polish',
    'sv': 'Swedish',
    'da': 'Danish',
    'fi': 'Finnish',
    'no': 'Norwegian',
    'bn': 'Bengali',
    'ta': 'Tamil',
    'te': 'Telugu',
    'mr': 'Marathi',
    'gu': 'Gujarati',
    'ur': 'Urdu',
}

def detect_and_translate(text, target_lang='en', source_lang='auto'):
    """
    Translate text using deep-translator (Google Translate backend).
    Falls back gracefully if network is unavailable.
    """
    try:
        from deep_translator import GoogleTranslator, single_detection
        
        # Detect source language
        detected_lang = 'en'
        detected_name = 'English'
        try:
            detected_lang = single_detection(text, api_key=None)
            detected_name = SUPPORTED_LANGUAGES.get(detected_lang, detected_lang.upper())
        except Exception:
            # Try heuristic detection as fallback
            text_lower = text.lower()
            if any(w in text_lower for w in ['excelente','producto','bateria','muy','calidad','entrega']):
                detected_lang = 'es'; detected_name = 'Spanish'
            elif any(w in text_lower for w in ['très','produit','batterie','livraison','qualité','mauvais']):
                detected_lang = 'fr'; detected_name = 'French'
            elif any(w in text_lower for w in ['sehr','gut','schlecht','qualität','lieferung','produkt']):
                detected_lang = 'de'; detected_name = 'German'
            elif any(w in text_lower for w in ['bahut','accha','kharab','batteri','guna','seva']):
                detected_lang = 'hi'; detected_name = 'Hindi'

        # Perform translation
        if detected_lang == target_lang:
            return {
                'original_text': text,
                'translated_text': text,
                'source_language': detected_lang,
                'source_language_name': detected_name,
                'target_language': target_lang,
                'target_language_name': SUPPORTED_LANGUAGES.get(target_lang, target_lang),
                'was_translated': False,
                'success': True
            }

        src = detected_lang if detected_lang != 'auto' else 'auto'
        translated = GoogleTranslator(source=src, target=target_lang).translate(text)

        return {
            'original_text': text,
            'translated_text': translated,
            'source_language': detected_lang,
            'source_language_name': detected_name,
            'target_language': target_lang,
            'target_language_name': SUPPORTED_LANGUAGES.get(target_lang, target_lang),
            'was_translated': True,
            'success': True
        }

    except Exception as e:
        # Network error or quota exceeded - return original with error note
        return {
            'original_text': text,
            'translated_text': text,
            'source_language': 'unknown',
            'source_language_name': 'Unknown',
            'target_language': target_lang,
            'target_language_name': SUPPORTED_LANGUAGES.get(target_lang, target_lang),
            'was_translated': False,
            'success': False,
            'error': f'Translation service unavailable: {str(e)}'
        }


@translate_bp.route('/translate', methods=['POST'])
@jwt_required
def translate_text():
    data = request.get_json() or {}
    text = data.get('text', '').strip()
    target_lang = data.get('target_language', 'en')
    source_lang = data.get('source_language', 'auto')

    if not text:
        return jsonify({'error': 'Text is required for translation.'}), 400

    if len(text) > 5000:
        return jsonify({'error': 'Text exceeds maximum limit of 5000 characters.'}), 400

    if target_lang not in SUPPORTED_LANGUAGES:
        return jsonify({'error': f'Unsupported target language: {target_lang}'}), 400

    result = detect_and_translate(text, target_lang, source_lang)
    user_id = request.current_user['id']
    log_activity(user_id, 'TRANSLATION', f"Translated text from {result['source_language_name']} to {result['target_language_name']}.")

    return jsonify(result), 200


@translate_bp.route('/translate/languages', methods=['GET'])
@jwt_required
def get_supported_languages():
    langs = [{'code': code, 'name': name} for code, name in SUPPORTED_LANGUAGES.items()]
    return jsonify({'languages': langs, 'total': len(langs)}), 200


@translate_bp.route('/translate/bulk', methods=['POST'])
@jwt_required
def translate_bulk():
    data = request.get_json() or {}
    texts = data.get('texts', [])
    target_lang = data.get('target_language', 'en')

    if not texts or not isinstance(texts, list):
        return jsonify({'error': 'A list of texts is required.'}), 400

    if len(texts) > 100:
        return jsonify({'error': 'Bulk translation is limited to 100 texts per request.'}), 400

    if target_lang not in SUPPORTED_LANGUAGES:
        return jsonify({'error': f'Unsupported target language: {target_lang}'}), 400

    results = []
    for t in texts:
        if isinstance(t, str) and t.strip():
            results.append(detect_and_translate(t.strip(), target_lang))

    user_id = request.current_user['id']
    log_activity(user_id, 'BULK_TRANSLATION', f"Bulk translated {len(results)} texts to {SUPPORTED_LANGUAGES.get(target_lang)}.")

    return jsonify({
        'results': results,
        'total': len(results),
        'target_language': target_lang,
        'target_language_name': SUPPORTED_LANGUAGES.get(target_lang)
    }), 200
