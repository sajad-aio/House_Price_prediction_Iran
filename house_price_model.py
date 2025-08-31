import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, GridSearchCV, cross_val_score
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import joblib
import warnings
warnings.filterwarnings('ignore')

class HousePricePredictor:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.feature_names = None
        self.is_trained = False
        
    def load_and_preprocess_data(self, csv_path):
        """Load and preprocess the house data"""
        try:
            # Load data
            df = pd.read_csv(csv_path)
            print(f"Dataset loaded successfully with {len(df)} records")
            
            # Handle missing values
            df = df.dropna()
            
            # Remove outliers using IQR method
            Q1 = df['Price'].quantile(0.25)
            Q3 = df['Price'].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - 1.5 * IQR
            upper_bound = Q3 + 1.5 * IQR
            df = df[(df['Price'] >= lower_bound) & (df['Price'] <= upper_bound)]
            
            # Feature engineering
            df['Price_per_sqm'] = df['Price'] / df['Area']
            df['Total_amenities'] = df['Parking'] + df['Warehouse'] + df['Elevator']
            
            # Encode categorical variables
            df['Address_encoded'] = self.label_encoder.fit_transform(df['Address'])
            
            # Select features
            feature_columns = ['Area', 'Room', 'Parking', 'Warehouse', 'Elevator', 
                             'Address_encoded', 'Total_amenities']
            
            X = df[feature_columns]
            y = df['Price']
            
            self.feature_names = feature_columns
            
            print(f"Data preprocessed successfully. Features: {feature_columns}")
            print(f"Dataset shape after preprocessing: {X.shape}")
            
            return X, y, df
            
        except Exception as e:
            print(f"Error in data preprocessing: {str(e)}")
            return None, None, None
    
    def train_model(self, X, y):
        """Train multiple models and select the best one"""
        try:
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            # Scale features
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Define models to test
            models = {
                'RandomForest': RandomForestRegressor(random_state=42),
                'GradientBoosting': GradientBoostingRegressor(random_state=42),
                'LinearRegression': LinearRegression()
            }
            
            best_model = None
            best_score = float('-inf')
            best_name = ""
            
            print("Training and evaluating models...")
            
            for name, model in models.items():
                # Cross-validation
                if name == 'LinearRegression':
                    scores = cross_val_score(model, X_train_scaled, y_train, cv=5, scoring='r2')
                    model.fit(X_train_scaled, y_train)
                    y_pred = model.predict(X_test_scaled)
                else:
                    scores = cross_val_score(model, X_train, y_train, cv=5, scoring='r2')
                    model.fit(X_train, y_train)
                    y_pred = model.predict(X_test)
                
                avg_score = scores.mean()
                r2 = r2_score(y_test, y_pred)
                mse = mean_squared_error(y_test, y_pred)
                mae = mean_absolute_error(y_test, y_pred)
                
                print(f"{name}:")
                print(f"  Cross-validation R² score: {avg_score:.4f} (+/- {scores.std() * 2:.4f})")
                print(f"  Test R² score: {r2:.4f}")
                print(f"  MSE: {mse:.2e}")
                print(f"  MAE: {mae:.2e}")
                print()
                
                if avg_score > best_score:
                    best_score = avg_score
                    best_model = model
                    best_name = name
            
            # Hyperparameter tuning for the best model
            if best_name == 'RandomForest':
                param_grid = {
                    'n_estimators': [100, 200],
                    'max_depth': [10, 20, None],
                    'min_samples_split': [2, 5],
                    'min_samples_leaf': [1, 2]
                }
                grid_search = GridSearchCV(
                    RandomForestRegressor(random_state=42),
                    param_grid, cv=3, scoring='r2', n_jobs=-1
                )
                grid_search.fit(X_train, y_train)
                self.model = grid_search.best_estimator_
                print(f"Best parameters for RandomForest: {grid_search.best_params_}")
                
            elif best_name == 'GradientBoosting':
                param_grid = {
                    'n_estimators': [100, 200],
                    'learning_rate': [0.05, 0.1, 0.15],
                    'max_depth': [3, 5, 7]
                }
                grid_search = GridSearchCV(
                    GradientBoostingRegressor(random_state=42),
                    param_grid, cv=3, scoring='r2', n_jobs=-1
                )
                grid_search.fit(X_train, y_train)
                self.model = grid_search.best_estimator_
                print(f"Best parameters for GradientBoosting: {grid_search.best_params_}")
                
            else:
                self.model = best_model
            
            # Final evaluation
            if best_name == 'LinearRegression':
                y_pred_final = self.model.predict(X_test_scaled)
            else:
                y_pred_final = self.model.predict(X_test)
                
            final_r2 = r2_score(y_test, y_pred_final)
            final_mse = mean_squared_error(y_test, y_pred_final)
            final_mae = mean_absolute_error(y_test, y_pred_final)
            
            print(f"Final model ({best_name}) performance:")
            print(f"  R² score: {final_r2:.4f}")
            print(f"  MSE: {final_mse:.2e}")
            print(f"  MAE: {final_mae:.2e}")
            
            self.is_trained = True
            return True
            
        except Exception as e:
            print(f"Error in model training: {str(e)}")
            return False
    
    def predict(self, features):
        """Make prediction for new data"""
        if not self.is_trained:
            raise ValueError("Model is not trained yet!")
        
        try:
            # Convert to DataFrame if it's a list
            if isinstance(features, list):
                features = np.array(features).reshape(1, -1)
            elif isinstance(features, dict):
                # Convert dict to array in correct order
                feature_array = []
                for feature_name in self.feature_names:
                    if feature_name == 'Total_amenities':
                        # Calculate total amenities
                        total = features.get('Parking', 0) + features.get('Warehouse', 0) + features.get('Elevator', 0)
                        feature_array.append(total)
                    elif feature_name == 'Address_encoded':
                        # Encode address
                        address = features.get('Address', '')
                        try:
                            encoded = self.label_encoder.transform([address])[0]
                        except:
                            # If address not seen before, use most common encoding
                            encoded = 0
                        feature_array.append(encoded)
                    else:
                        feature_array.append(features.get(feature_name, 0))
                features = np.array(feature_array).reshape(1, -1)
            
            # Scale features if using LinearRegression
            if isinstance(self.model, LinearRegression):
                features = self.scaler.transform(features)
            
            prediction = self.model.predict(features)[0]
            return max(0, prediction)  # Ensure non-negative price
            
        except Exception as e:
            print(f"Error in prediction: {str(e)}")
            return None
    
    def save_model(self, filepath):
        """Save the trained model"""
        if not self.is_trained:
            raise ValueError("Model is not trained yet!")
        
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'label_encoder': self.label_encoder,
            'feature_names': self.feature_names
        }
        joblib.dump(model_data, filepath)
        print(f"Model saved to {filepath}")
    
    def load_model(self, filepath):
        """Load a trained model"""
        try:
            model_data = joblib.load(filepath)
            self.model = model_data['model']
            self.scaler = model_data['scaler']
            self.label_encoder = model_data['label_encoder']
            self.feature_names = model_data['feature_names']
            self.is_trained = True
            print(f"Model loaded from {filepath}")
            return True
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            return False
    
    def get_feature_importance(self):
        """Get feature importance for tree-based models"""
        if not self.is_trained:
            return None
        
        if hasattr(self.model, 'feature_importances_'):
            importance_dict = dict(zip(self.feature_names, self.model.feature_importances_))
            return sorted(importance_dict.items(), key=lambda x: x[1], reverse=True)
        return None

def main():
    # Initialize predictor
    predictor = HousePricePredictor()
    
    # Load and preprocess data
    X, y, df = predictor.load_and_preprocess_data('house_cleaned.csv')
    
    if X is not None:
        # Train model
        success = predictor.train_model(X, y)
        
        if success:
            # Save model
            predictor.save_model('house_price_model.pkl')
            
            # Show feature importance
            importance = predictor.get_feature_importance()
            if importance:
                print("\nFeature Importance:")
                for feature, imp in importance:
                    print(f"  {feature}: {imp:.4f}")
            
            # Example prediction
            print("\nExample prediction:")
            sample_features = {
                'Area': 100,
                'Room': 2,
                'Parking': 1,
                'Warehouse': 1,
                'Elevator': 1,
                'Address': 'Shahran'
            }
            
            prediction = predictor.predict(sample_features)
            if prediction:
                print(f"Predicted price: {prediction:,.0f} Toman")
                print(f"Predicted price: ${prediction/30000:,.0f} USD")

if __name__ == "__main__":
    main()