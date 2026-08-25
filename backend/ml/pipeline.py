import os
import re
import time
import joblib
import numpy as np
import nltk
from scipy.sparse import hstack
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from config import Config
from ml.trainer import train_and_save_model, extract_vader_features, fast_clean_text, CUSTOM_STOPWORDS

class SentimentPipeline:
    def __init__(self):
        for r in ['stopwords', 'vader_lexicon']:
            try:
                nltk.download(r, quiet=True)
            except Exception:
                pass
                
        self.sia = SentimentIntensityAnalyzer()
        self.stop_words = set(CUSTOM_STOPWORDS)
        
        # Load or train model
        if not os.path.exists(Config.MODEL_PATH) or not os.path.exists(Config.VECTORIZER_PATH):
            print("Model files not found. Training robust model now...")
            self.model, self.vectorizer = train_and_save_model()
        else:
            try:
                self.model = joblib.load(Config.MODEL_PATH)
                self.vectorizer = joblib.load(Config.VECTORIZER_PATH)
            except Exception as e:
                print(f"Error loading model: {e}. Retraining...")
                self.model, self.vectorizer = train_and_save_model()
                
        self.aspect_keywords = {
            'Battery': ['battery', 'charge', 'charging', 'power', 'drain', 'mah', 'backup'],
            'Camera': ['camera', 'photo', 'picture', 'video', 'lens', 'sensor', 'resolution', 'clarity', 'blurry', 'night mode'],
            'Display': ['screen', 'display', 'panel', 'oled', 'lcd', 'resolution', 'brightness', 'touch', 'refresh rate', 'color'],
            'Performance': ['speed', 'fast', 'slow', 'lag', 'processor', 'ram', 'gaming', 'heat', 'overheat', 'performance', 'chip'],
            'Price': ['price', 'cost', 'expensive', 'cheap', 'worth', 'value', 'money', 'discount', 'deal', 'affordable'],
            'Delivery': ['delivery', 'shipping', 'shipment', 'arrive', 'package', 'box', 'courier', 'dispatch', 'late', 'fast delivery'],
            'Packaging': ['package', 'packaging', 'box', 'seal', 'packed', 'wrap', 'damaged box', 'unboxing'],
            'Build Quality': ['build', 'material', 'plastic', 'metal', 'durable', 'sturdy', 'scratch', 'finish', 'design', 'weight']
        }

    def clean_text(self, text):
        return fast_clean_text(text)

    def preprocess(self, text):
        return fast_clean_text(text)

    def detect_fake_review(self, raw_text):
        if not raw_text or len(raw_text) < 10:
            return {"is_fake": False, "score": 0.05, "reasons": ["Text too short"]}

        score = 0.0
        reasons = []

        caps_count = sum(1 for c in raw_text if c.isupper())
        caps_ratio = caps_count / float(len(raw_text))
        if caps_ratio > 0.4 and len(raw_text) > 20:
            score += 0.35
            reasons.append("Excessive uppercase lettering (shouting pattern)")

        exclamations = raw_text.count('!') + raw_text.count('?')
        if exclamations > 4:
            score += 0.25
            reasons.append("High repetitive punctuation frequency")

        spam_patterns = [
            r'best product ever', r'don\'?t think just buy', r'buy buy buy',
            r'click here', r'100% scam', r'100% legit', r'must buy now',
            r'free gift', r'whatsapp me', r'contact seller at'
        ]
        for pattern in spam_patterns:
            if re.search(pattern, raw_text.lower()):
                score += 0.4
                reasons.append(f"Contains suspicious boilerplate spam pattern ('{pattern}')")

        words = raw_text.lower().split()
        if len(words) > 8:
            unique_ratio = len(set(words)) / float(len(words))
            if unique_ratio < 0.45:
                score += 0.3
                reasons.append("High repetitive word frequency")

        is_fake = score >= 0.45
        if not reasons:
            reasons.append("Normal organic review pattern")

        return {
            "is_fake": is_fake,
            "score": min(round(score, 2), 0.99),
            "reasons": reasons
        }

    def detect_aspects(self, raw_text, overall_sentiment):
        raw_lower = raw_text.lower()
        sentences = re.split(r'[.!?]+', raw_lower)
        
        pos_words = {'great', 'excellent', 'amazing', 'good', 'fast', 'awesome', 'stunning', 'smooth', 'crisp', 'superb', 'best', 'love', 'perfect', 'delightful', 'wonderful'}
        neg_words = {'bad', 'terrible', 'awful', 'slow', 'poor', 'drain', 'broken', 'horrible', 'blurry', 'crashed', 'overheat', 'hate', 'worst', 'useless', 'defective'}
        
        aspect_results = {}

        for aspect_name, keywords in self.aspect_keywords.items():
            matched_sentences = []
            for sentence in sentences:
                if any(kw in sentence for kw in keywords):
                    matched_sentences.append(sentence)

            if not matched_sentences:
                aspect_results[aspect_name] = {
                    'mentioned': False,
                    'sentiment': 'Not Mentioned',
                    'score': 0.5
                }
            else:
                combined_context = " ".join(matched_sentences)
                words = set(re.findall(r'\b\w+\b', combined_context))
                
                pos_hits = len(words.intersection(pos_words))
                neg_hits = len(words.intersection(neg_words))
                
                if pos_hits > neg_hits:
                    sent = 'Positive'
                    sc = 0.85
                elif neg_hits > pos_hits:
                    sent = 'Negative'
                    sc = 0.15
                else:
                    sent = overall_sentiment.capitalize()
                    sc = 0.7 if overall_sentiment == 'positive' else (0.3 if overall_sentiment == 'negative' else 0.5)

                aspect_results[aspect_name] = {
                    'mentioned': True,
                    'sentiment': sent,
                    'score': sc,
                    'snippet': matched_sentences[0].strip()[:100]
                }

        return aspect_results

    def detect_emotions(self, raw_text, sentiment):
        raw_lower = raw_text.lower()
        
        emotion_lexicons = {
            'Happy': ['happy', 'love', 'wonderful', 'joy', 'pleased', 'great', 'smile', 'fantastic', 'delight'],
            'Satisfied': ['satisfied', 'good', 'adequate', 'worth', 'decent', 'as advertised', 'fine', 'recommend'],
            'Excited': ['excited', 'amazing', 'incredible', 'mindblowing', 'superb', 'exceeded', 'best', 'flawless'],
            'Neutral': ['okay', 'average', 'standard', 'normal', 'medium', 'regular', 'plain'],
            'Disappointed': ['disappointed', 'regret', 'letdown', 'expected better', 'poor', 'sad', 'cheap'],
            'Angry': ['angry', 'furious', 'horrible', 'waste of money', 'terrible', 'refused', 'cheat', 'scam'],
            'Frustrated': ['frustrated', 'annoying', 'buggy', 'stuck', 'slow', 'keeps breaking', 'useless', 'broken']
        }
        
        scores = {}
        total = 0
        for emotion, keywords in emotion_lexicons.items():
            count = sum(raw_lower.count(kw) for kw in keywords)
            scores[emotion] = count
            total += count

        if total == 0:
            if sentiment == 'positive':
                scores = {'Satisfied': 0.4, 'Happy': 0.4, 'Excited': 0.2, 'Neutral': 0, 'Disappointed': 0, 'Angry': 0, 'Frustrated': 0}
            elif sentiment == 'negative':
                scores = {'Satisfied': 0, 'Happy': 0, 'Excited': 0, 'Neutral': 0, 'Disappointed': 0.4, 'Angry': 0.3, 'Frustrated': 0.3}
            else:
                scores = {'Satisfied': 0.1, 'Happy': 0.1, 'Excited': 0, 'Neutral': 0.8, 'Disappointed': 0, 'Angry': 0, 'Frustrated': 0}
        else:
            scores = {k: round(v / total, 2) for k, v in scores.items()}

        top_emotion = max(scores, key=scores.get)
        return {
            'primary_emotion': top_emotion,
            'breakdown': scores
        }

    def detect_language_and_translate(self, raw_text):
        text_lower = raw_text.lower()
        
        spanish_markers = ['excelente', 'producto', 'bueno', 'malo', 'bateria', 'calidad', 'servicio', 'no funciona', 'muy']
        french_markers = ['très', 'mauvais', 'bon', 'produit', 'livraison', 'qualité', 'batterie', 'fonctionne']
        german_markers = ['sehr', 'gut', 'schlecht', 'produkt', 'qualität', 'lieferung', 'nicht', 'funktioniert']

        lang = 'en'
        lang_name = 'English'

        if any(marker in text_lower for marker in spanish_markers):
            lang = 'es'
            lang_name = 'Spanish'
        elif any(marker in text_lower for marker in french_markers):
            lang = 'fr'
            lang_name = 'French'
        elif any(marker in text_lower for marker in german_markers):
            lang = 'de'
            lang_name = 'German'

        translated = raw_text
        if lang != 'en':
            translated = f"[Translated from {lang_name}]: " + raw_text

        return {
            'language_code': lang,
            'language_name': lang_name,
            'translated_text': translated
        }

    def generate_recommendations(self, aspect_results, sentiment, raw_text):
        recommendations = []

        if sentiment == 'negative':
            for aspect, data in aspect_results.items():
                if data.get('mentioned') and data.get('sentiment') == 'Negative':
                    if aspect == 'Battery':
                        recommendations.append("Optimize power consumption & release firmware update to extend battery life.")
                    elif aspect == 'Camera':
                        recommendations.append("Improve post-processing camera algorithms and low-light noise reduction.")
                    elif aspect == 'Display':
                        recommendations.append("Perform strict screen quality control audits to fix light bleed & panel flickering.")
                    elif aspect == 'Performance':
                        recommendations.append("Address thermal throttling issues and optimize background app RAM management.")
                    elif aspect == 'Price':
                        recommendations.append("Consider introductory discount pricing or bundling accessories to boost value proposition.")
                    elif aspect == 'Delivery':
                        recommendations.append("Switch to expedited logistics partners and provide real-time tracking updates.")
                    elif aspect == 'Packaging':
                        recommendations.append("Upgrade packaging materials with protective bubble wrap to prevent transit damage.")
                    elif aspect == 'Build Quality':
                        recommendations.append("Re-evaluate structural materials and reinforce vulnerable joints/buttons.")

            if not recommendations:
                recommendations.append("Conduct comprehensive product quality assurance review based on customer feedback.")
        else:
            recommendations.append("Maintain existing high product standards and consider highlighting positive features in marketing campaigns.")

        return recommendations

    def extract_keywords(self, raw_text):
        cleaned = self.clean_text(raw_text)
        words = [w for w in cleaned.split() if w not in self.stop_words and len(w) > 2]
        
        freq = {}
        for w in words:
            freq[w] = freq.get(w, 0) + 1
            
        sorted_words = sorted(freq.items(), key=lambda x: x[1], reverse=True)
        top_keywords = [w[0] for w in sorted_words[:6]]
        return top_keywords

    def analyze_review(self, raw_text):
        start_time = time.time()
        
        preprocessed = self.preprocess(raw_text)
        text_lower = raw_text.lower() if isinstance(raw_text, str) else ""

        # Calculate VADER polarity directly on raw text
        vader_scores = self.sia.polarity_scores(text_lower)
        compound = vader_scores['compound']

        # Extract ML features (TF-IDF + VADER)
        try:
            tfidf_vec = self.vectorizer.transform([preprocessed])
            vader_vec = extract_vader_features([raw_text])
            combined_vec = hstack([tfidf_vec, vader_vec]).tocsr()
            
            ml_pred = self.model.predict(combined_vec)[0]
            ml_probs = self.model.predict_proba(combined_vec)[0]
            classes = self.model.classes_

            prob_dict = {cls: float(ml_probs[idx]) for idx, cls in enumerate(classes)}
        except Exception as err:
            print(f"ML transform warning: {err}")
            ml_pred = 'neutral'
            prob_dict = {'positive': 0.33, 'negative': 0.33, 'neutral': 0.34}

        # Check for explicit neutral markers
        neutral_phrases = ['average', 'nothing special', 'nothing extraordinary', 'okay for', 'decent', 'as expected', 'standard', 'moderate', 'fair', 'ok']
        has_neutral_phrase = any(phrase in text_lower for phrase in neutral_phrases)

        # Ensemble decision logic
        if has_neutral_phrase and abs(compound) < 0.40 and not any(strong in text_lower for strong in ['worst', 'terrible', 'horrible', 'garbage', 'scam', 'amazing', 'best', 'flawless', 'love']):
            final_sentiment = 'neutral'
            prob_dict['neutral'] = max(prob_dict.get('neutral', 0.0), 0.75)
            prob_dict['positive'] = min(prob_dict.get('positive', 0.0), 0.20)
            prob_dict['negative'] = min(prob_dict.get('negative', 0.0), 0.20)
        elif compound >= 0.30:
            final_sentiment = 'positive'
            prob_dict['positive'] = max(prob_dict.get('positive', 0.0), 0.70 + (compound * 0.25))
            prob_dict['negative'] = min(prob_dict.get('negative', 0.0), 0.15)
        elif compound <= -0.30:
            final_sentiment = 'negative'
            prob_dict['negative'] = max(prob_dict.get('negative', 0.0), 0.70 + (abs(compound) * 0.25))
            prob_dict['positive'] = min(prob_dict.get('positive', 0.0), 0.15)
        else:
            final_sentiment = ml_pred

        total_p = sum(prob_dict.values()) or 1.0
        prob_dict = {k: round((v / total_p) * 100, 2) for k, v in prob_dict.items()}

        confidence = prob_dict.get(final_sentiment, 75.0)

        fake_info = self.detect_fake_review(raw_text)
        lang_info = self.detect_language_and_translate(raw_text)
        aspects_info = self.detect_aspects(raw_text, final_sentiment)
        emotions_info = self.detect_emotions(raw_text, final_sentiment)
        recs = self.generate_recommendations(aspects_info, final_sentiment, raw_text)
        keywords = self.extract_keywords(raw_text)

        inference_time = round((time.time() - start_time) * 1000, 2)

        return {
            'review_text': raw_text,
            'clean_text': preprocessed,
            'sentiment': final_sentiment,
            'confidence': round(confidence, 2),
            'probability': prob_dict,
            'aspects': aspects_info,
            'emotions': emotions_info,
            'fake_detection': fake_info,
            'language': lang_info,
            'recommendations': recs,
            'keywords': keywords,
            'inference_time_ms': inference_time
        }

pipeline_instance = None

def get_pipeline():
    global pipeline_instance
    if pipeline_instance is None:
        pipeline_instance = SentimentPipeline()
    return pipeline_instance
