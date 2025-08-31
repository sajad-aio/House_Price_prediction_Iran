#!/usr/bin/env python3
"""
Tehran House Price Predictor
Run this script to train the model and start the web application
"""

import os
import sys
import subprocess

def install_requirements():
    """Install required packages"""
    print("Installing required packages...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Requirements installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing requirements: {e}")
        return False

def train_model():
    """Train the machine learning model"""
    print("\n🤖 Training the machine learning model...")
    try:
        from house_price_model import HousePricePredictor
        
        # Initialize predictor
        predictor = HousePricePredictor()
        
        # Load and preprocess data
        X, y, df = predictor.load_and_preprocess_data('house/house_cleaned.csv')
        
        if X is not None:
            # Train model
            success = predictor.train_model(X, y)
            
            if success:
                # Save model
                predictor.save_model('house_price_model.pkl')
                print("✅ Model trained and saved successfully!")
                
                # Show feature importance
                importance = predictor.get_feature_importance()
                if importance:
                    print("\n📊 Feature Importance:")
                    for feature, imp in importance:
                        print(f"  {feature}: {imp:.4f}")
                
                return True
            else:
                print("❌ Model training failed!")
                return False
        else:
            print("❌ Data loading failed!")
            return False
            
    except Exception as e:
        print(f"❌ Error during model training: {e}")
        return False

def start_web_app():
    """Start the Flask web application"""
    print("\n🌐 Starting the web application...")
    try:
        from app import app
        print("✅ Web application starting...")
        print("🔗 Open your browser and go to: http://localhost:5000")
        print("Press Ctrl+C to stop the server")
        app.run(debug=True, host='0.0.0.0', port=5000)
    except Exception as e:
        print(f"❌ Error starting web application: {e}")

def main():
    print("🏠 Tehran House Price Predictor")
    print("=" * 50)
    
    # Check if model exists
    if not os.path.exists('house_price_model.pkl'):
        print("📦 Model not found. Training new model...")
        
        # Install requirements if needed
        if not install_requirements():
            return
        
        # Train model
        if not train_model():
            return
    else:
        print("✅ Model found! Skipping training...")
    
    # Start web application
    start_web_app()

if __name__ == "__main__":
    main()