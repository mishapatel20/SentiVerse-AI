from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from database import init_db
from routes.auth_routes import auth_bp
from routes.predict_routes import predict_bp
from routes.history_routes import history_bp
from routes.dashboard_routes import dashboard_bp
from routes.admin_routes import admin_bp
from routes.translate_routes import translate_bp
from routes.report_routes import report_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable CORS for all routes (Vite dev server support)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize Database Schema & Seed Admin/Demo
    init_db()

    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(predict_bp)
    app.register_blueprint(history_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(translate_bp)
    app.register_blueprint(report_bp)

    @app.route('/')
    def health_check():
        return jsonify({
            'status': 'online',
            'service': 'SentiVerse AI Sentiment Analysis REST Engine',
            'version': '2.4.0-production'
        }), 200

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Endpoint not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500

    return app

if __name__ == '__main__':
    app = create_app()
    print("Starting SentiVerse Flask REST API on http://127.0.0.1:5000")
    app.run(host='127.0.0.1', port=5000, debug=True)
