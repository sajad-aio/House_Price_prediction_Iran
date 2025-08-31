from flask import Flask, render_template, request, jsonify
import pandas as pd
import numpy as np
from house_price_model import HousePricePredictor
import os

app = Flask(__name__)

# Initialize the predictor
predictor = HousePricePredictor()

# Load the model or train if not exists
model_path = 'house_price_model.pkl'
csv_path = 'house_cleaned.csv'

if os.path.exists(model_path):
    predictor.load_model(model_path)
else:
    # Train the model
    X, y, df = predictor.load_and_preprocess_data(csv_path)
    if X is not None:
        predictor.train_model(X, y)
        predictor.save_model(model_path)

# Get unique addresses for dropdown
df = pd.read_csv(csv_path)
unique_addresses = sorted(df['Address'].unique().tolist())

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/addresses')
def get_addresses():
    """Get all available addresses"""
    try:
        return jsonify({
            'success': True,
            'addresses': unique_addresses
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/api/search-address/<query>')
def search_address(query):
    """Search for addresses matching the query"""
    try:
        query = query.lower().strip()
        if not query:
            return jsonify({
                'success': True,
                'matches': []
            })
        
        # Find matching addresses
        matches = []
        for address in unique_addresses:
            address_lower = address.lower()
            # Check for exact match, starts with, or contains
            if query == address_lower:
                matches.insert(0, {'address': address, 'score': 100})
            elif address_lower.startswith(query):
                matches.append({'address': address, 'score': 90})
            elif query in address_lower:
                matches.append({'address': address, 'score': 70})
            # Check for partial word matches
            elif any(word.startswith(query) for word in address_lower.split()):
                matches.append({'address': address, 'score': 60})
        
        # Sort by score and limit results
        matches.sort(key=lambda x: x['score'], reverse=True)
        matches = matches[:10]  # Limit to top 10 matches
        
        return jsonify({
            'success': True,
            'matches': matches
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/api/validate-address', methods=['POST'])
def validate_address():
    """Validate if an address exists and return the best match"""
    try:
        data = request.get_json()
        input_address = data.get('address', '').strip()
        
        if not input_address:
            return jsonify({
                'success': False,
                'error': 'Address is required'
            })
        
        input_lower = input_address.lower()
        
        # Find exact match first
        for address in unique_addresses:
            if input_lower == address.lower():
                return jsonify({
                    'success': True,
                    'valid': True,
                    'matched_address': address,
                    'confidence': 100
                })
        
        # Find best partial match
        best_match = None
        best_score = 0
        
        for address in unique_addresses:
            address_lower = address.lower()
            score = 0
            
            if address_lower.startswith(input_lower):
                score = 90
            elif input_lower in address_lower:
                score = 70
            elif any(word.startswith(input_lower) for word in address_lower.split()):
                score = 60
            
            if score > best_score:
                best_score = score
                best_match = address
        
        if best_match and best_score >= 60:
            return jsonify({
                'success': True,
                'valid': True,
                'matched_address': best_match,
                'confidence': best_score
            })
        else:
            return jsonify({
                'success': True,
                'valid': False,
                'message': 'No matching address found. Please check the spelling or try a different address.',
                'suggestions': unique_addresses[:5]  # Show first 5 addresses as suggestions
            })
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        
        # Extract features from request
        features = {
            'Area': float(data.get('area', 0)),
            'Room': int(data.get('rooms', 0)),
            'Parking': int(data.get('parking', 0)),
            'Warehouse': int(data.get('warehouse', 0)),
            'Elevator': int(data.get('elevator', 0)),
            'Address': data.get('address', '')
        }
        
        # Make prediction
        prediction = predictor.predict(features)
        
        if prediction is not None:
            # Convert to USD (assuming 1 USD = 30,000 Toman)
            price_usd = prediction / 30000
            
            return jsonify({
                'success': True,
                'price_toman': f"{prediction:,.0f}",
                'price_usd': f"{price_usd:,.0f}",
                'raw_price': prediction
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Prediction failed'
            })
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/api/stats')
def get_stats():
    """Get dataset statistics"""
    try:
        df = pd.read_csv(csv_path)
        
        stats = {
            'total_properties': len(df),
            'avg_price': f"{df['Price'].mean():,.0f}",
            'min_price': f"{df['Price'].min():,.0f}",
            'max_price': f"{df['Price'].max():,.0f}",
            'avg_area': f"{df['Area'].mean():.0f}",
            'total_addresses': len(df['Address'].unique()),
            'price_ranges': {
                'under_1b': len(df[df['Price'] < 1000000000]),
                '1b_to_5b': len(df[(df['Price'] >= 1000000000) & (df['Price'] < 5000000000)]),
                '5b_to_10b': len(df[(df['Price'] >= 5000000000) & (df['Price'] < 10000000000)]),
                'over_10b': len(df[df['Price'] >= 10000000000])
            }
        }
        
        return jsonify(stats)
        
    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/api/address-stats/<address>')
def get_address_stats(address):
    """Get statistics for a specific address"""
    try:
        df = pd.read_csv(csv_path)
        address_data = df[df['Address'] == address]
        
        if len(address_data) == 0:
            return jsonify({'error': 'Address not found'})
        
        stats = {
            'count': len(address_data),
            'avg_price': f"{address_data['Price'].mean():,.0f}",
            'min_price': f"{address_data['Price'].min():,.0f}",
            'max_price': f"{address_data['Price'].max():,.0f}",
            'avg_area': f"{address_data['Area'].mean():.0f}",
            'avg_rooms': f"{address_data['Room'].mean():.1f}"
        }
        
        return jsonify(stats)
        
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)