import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'sentiverse-super-secret-jwt-key-2026')
    JWT_EXPIRATION_HOURS = 24
    DATABASE_PATH = os.path.join(os.path.dirname(__file__), 'sentiverse.db')
    MODEL_PATH = os.path.join(os.path.dirname(__file__), 'ml', 'model.pkl')
    VECTORIZER_PATH = os.path.join(os.path.dirname(__file__), 'ml', 'vectorizer.pkl')
    CORS_HEADERS = 'Content-Type'
