#!/usr/bin/env python3
"""
House Price Predictor Web Application Runner
"""

import os
import sys
from app import app

def main():
    """Run the Flask application"""
    print("🏠 Starting House Price Predictor Web Application...")
    print("📊 Loading AI models and data...")
    
    # Set environment variables
    os.environ['FLASK_ENV'] = 'development'
    os.environ['FLASK_DEBUG'] = '1'
    
    try:
        print("🚀 Server starting on http://localhost:5000")
        print("📱 Open your browser and navigate to: http://localhost:5000")
        print("⭐ Features:")
        print("   - AI-powered house price prediction")
        print("   - Modern responsive UI with animations")
        print("   - Real-time market statistics")
        print("   - Interactive data visualization")
        print("\n🔥 Press Ctrl+C to stop the server\n")
        
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=True,
            use_reloader=True
        )
        
    except KeyboardInterrupt:
        print("\n👋 Server stopped. Thank you for using House Price Predictor!")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()