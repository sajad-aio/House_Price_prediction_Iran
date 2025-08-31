# House_Price_prediction_Iran
--------
# 🏠 House Price Predictor - AI-Powered Real Estate Valuation

A modern, responsive web application that uses advanced machine learning algorithms to predict house prices with stunning UI animations and transitions.

## ✨ Features

- **🤖 AI-Powered Predictions**: Advanced ML models (Random Forest, Gradient Boosting, Linear Regression)
- **🎨 Modern UI**: Beautiful, responsive design with extensive animations and transitions
- **📊 Real-time Statistics**: Live market insights and data visualization
- **⚡ Instant Results**: Fast predictions with animated result displays
- **📱 Mobile Responsive**: Optimized for all device sizes
- **🎭 Rich Animations**: Loading screens, transitions, hover effects, and micro-interactions

## 🚀 Quick Start

### Prerequisites

- Python 3.7+
- pip (Python package installer)

### Installation

1. **Navigate to the web directory:**
   ```bash
   cd house/web
   ```

2. **Install required packages:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application:**
   ```bash
   python run_app.py
   ```

4. **Open your browser and visit:**
   ```
   http://localhost:5000
   ```

## 🛠️ Technology Stack

### Backend
- **Flask**: Python web framework
- **Pandas**: Data manipulation and analysis
- **Scikit-learn**: Machine learning algorithms
- **NumPy**: Numerical computing

### Frontend
- **HTML5**: Modern semantic markup
- **CSS3**: Advanced styling with animations
- **JavaScript (ES6+)**: Interactive functionality
- **Font Awesome**: Icon library
- **Google Fonts**: Typography

### Machine Learning
- **Random Forest Regressor**: Ensemble learning method
- **Gradient Boosting Regressor**: Boosting algorithm
- **Linear Regression**: Statistical modeling
- **Feature Engineering**: Advanced data preprocessing

## 🎨 UI Features

### Animations & Transitions
- **Loading Screen**: Animated logo with progress bar
- **Hero Section**: Floating shapes and morphing elements
- **Form Interactions**: Input focus effects and validation
- **Result Display**: Animated counters and progress bars
- **Scroll Animations**: Elements animate as they enter viewport
- **Hover Effects**: Interactive buttons and cards

### Visual Elements
- **Gradient Backgrounds**: Dynamic color schemes
- **3D House Model**: CSS-only 3D visualization
- **Chart Animations**: Animated statistics and distributions
- **Particle Effects**: Floating particles in background
- **Responsive Design**: Adapts to all screen sizes

## 📊 Machine Learning Model

### Data Processing
- **Outlier Removal**: IQR method for data cleaning
- **Feature Engineering**: Creating derived features
- **Categorical Encoding**: Label encoding for addresses
- **Data Scaling**: StandardScaler for numerical features

### Model Training
- **Cross-Validation**: 5-fold CV for model evaluation
- **Hyperparameter Tuning**: GridSearchCV optimization
- **Model Selection**: Best performing algorithm selection
- **Performance Metrics**: R², MSE, MAE evaluation

### Features Used
- **Area**: Property size in square meters
- **Rooms**: Number of rooms
- **Parking**: Number of parking spaces
- **Warehouse**: Warehouse availability (Yes/No)
- **Elevator**: Elevator availability (Yes/No)
- **Address**: Property location
- **Total Amenities**: Derived feature

## 🎯 API Endpoints

### Main Routes
- `GET /`: Main application page
- `POST /predict`: House price prediction
- `GET /api/stats`: Dataset statistics
- `GET /api/address-stats/<address>`: Address-specific statistics

### Prediction Request Format
```json
{
  "area": 100,
  "rooms": 3,
  "parking": 1,
  "warehouse": 1,
  "elevator": 1,
  "address": "Shahran"
}
```

### Response Format
```json
{
  "success": true,
  "price_toman": "2,500,000,000",
  "price_usd": "83,333",
  "raw_price": 2500000000
}
```

## 📁 Project Structure

```
house/web/
├── app.py                 # Flask application
├── house_price_model.py   # ML model implementation
├── run_app.py            # Application runner
├── requirements.txt      # Python dependencies
├── house_cleaned.csv     # Dataset
├── templates/
│   └── index.html        # Main HTML template
├── static/
│   ├── css/
│   │   ├── style.css     # Main styles
│   │   └── animations.css # Animation styles
│   └── js/
│       └── script.js     # JavaScript functionality
└── README.md            # This file
```

## 🎮 Usage Guide

### Making Predictions
1. **Fill the Form**: Enter property details in the prediction form
2. **Select Address**: Choose from available locations
3. **Submit**: Click "Predict Price" button
4. **View Results**: See animated price prediction with confidence metrics

### Viewing Statistics
- **Market Overview**: Total properties, average prices, locations
- **Price Distribution**: Visual breakdown of price ranges
- **Address Stats**: Location-specific market data

## 🔧 Customization

### Adding New Animations
1. Add CSS animations to `static/css/animations.css`
2. Apply animation classes in HTML or JavaScript
3. Control timing with CSS variables

### Modifying the Model
1. Update `house_price_model.py` for new algorithms
2. Retrain model with new data
3. Update prediction endpoint in `app.py`

### Styling Changes
1. Modify CSS variables in `:root` selector
2. Update color schemes and gradients
3. Adjust animation timings and effects

## 🐛 Troubleshooting

### Common Issues

**Model not found error:**
- Ensure `house_cleaned.csv` is in the web directory
- Run the app once to train and save the model

**Static files not loading:**
- Check Flask static folder configuration
- Verify file paths in templates

**Prediction errors:**
- Validate input data types and ranges
- Check address encoding in the model

## 📈 Performance Optimization

- **Lazy Loading**: Images and heavy content
- **Throttled Events**: Scroll and resize handlers
- **Efficient Animations**: CSS transforms over layout changes
- **Caching**: Model and data caching for faster responses

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Scikit-learn**: For machine learning algorithms
- **Flask**: For the web framework
- **Font Awesome**: For beautiful icons
- **Google Fonts**: For typography
- **CSS Animation Libraries**: For inspiration

---

**Made with ❤️ and lots of ☕**

For questions or support, please open an issue in the repository.
