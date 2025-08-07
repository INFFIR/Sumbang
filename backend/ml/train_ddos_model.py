import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import joblib
import matplotlib.pyplot as plt
import seaborn as sns

def generate_synthetic_data(n_samples=10000):
    """
    Generate synthetic network traffic data for DDoS detection
    """
    np.random.seed(42)
    
    # Normal traffic characteristics
    normal_samples = n_samples // 2
    
    # Normal traffic: lower packet rates, longer connections, varied protocols
    normal_packet_rate = np.random.normal(50, 20, normal_samples)  # Normal: 10-100 packets/sec
    normal_packet_rate = np.clip(normal_packet_rate, 1, 200)
    
    normal_connection_duration = np.random.exponential(10, normal_samples)  # Normal: longer connections
    normal_connection_duration = np.clip(normal_connection_duration, 0.1, 300)
    
    normal_bytes_per_packet = np.random.normal(800, 200, normal_samples)  # Normal packet sizes
    normal_bytes_per_packet = np.clip(normal_bytes_per_packet, 64, 1500)
    
    normal_unique_ips = np.random.poisson(10, normal_samples)  # Normal: diverse IP sources
    normal_unique_ips = np.clip(normal_unique_ips, 1, 100)
    
    normal_protocol_variety = np.random.uniform(0.3, 1.0, normal_samples)  # Normal: protocol diversity
    
    normal_syn_ratio = np.random.beta(2, 8, normal_samples)  # Normal: low SYN ratio
    
    # DDoS attack characteristics
    attack_samples = n_samples // 2
    
    # DDoS traffic: high packet rates, short connections, uniform patterns
    attack_packet_rate = np.random.normal(5000, 1500, attack_samples)  # Attack: high packet rates
    attack_packet_rate = np.clip(attack_packet_rate, 1000, 20000)
    
    attack_connection_duration = np.random.exponential(0.5, attack_samples)  # Attack: short connections
    attack_connection_duration = np.clip(attack_connection_duration, 0.01, 5)
    
    attack_bytes_per_packet = np.random.normal(200, 100, attack_samples)  # Attack: smaller packets
    attack_bytes_per_packet = np.clip(attack_bytes_per_packet, 32, 800)
    
    attack_unique_ips = np.random.poisson(2, attack_samples)  # Attack: few IP sources (botnet)
    attack_unique_ips = np.clip(attack_unique_ips, 1, 10)
    
    attack_protocol_variety = np.random.uniform(0.0, 0.3, attack_samples)  # Attack: low protocol diversity
    
    attack_syn_ratio = np.random.beta(8, 2, attack_samples)  # Attack: high SYN ratio (SYN flood)
    
    # Combine data
    packet_rate = np.concatenate([normal_packet_rate, attack_packet_rate])
    connection_duration = np.concatenate([normal_connection_duration, attack_connection_duration])
    bytes_per_packet = np.concatenate([normal_bytes_per_packet, attack_bytes_per_packet])
    unique_ips = np.concatenate([normal_unique_ips, attack_unique_ips])
    protocol_variety = np.concatenate([normal_protocol_variety, attack_protocol_variety])
    syn_ratio = np.concatenate([normal_syn_ratio, attack_syn_ratio])
    
    # Create additional engineered features
    bandwidth_usage = packet_rate * bytes_per_packet
    connection_rate = packet_rate / (connection_duration + 0.001)  # Avoid division by zero
    ip_diversity_ratio = unique_ips / (packet_rate + 1)
    
    # Labels: 0 for normal, 1 for attack
    labels = np.concatenate([np.zeros(normal_samples), np.ones(attack_samples)])
    
    # Create DataFrame
    data = pd.DataFrame({
        'packet_rate': packet_rate,
        'connection_duration': connection_duration,
        'bytes_per_packet': bytes_per_packet,
        'unique_source_ips': unique_ips,
        'protocol_variety': protocol_variety,
        'syn_packet_ratio': syn_ratio,
        'bandwidth_usage': bandwidth_usage,
        'connection_rate': connection_rate,
        'ip_diversity_ratio': ip_diversity_ratio,
        'is_attack': labels
    })
    
    # Shuffle the dataset
    data = data.sample(frac=1, random_state=42).reset_index(drop=True)
    
    return data

def train_enhanced_model():
    """
    Train an enhanced DDoS detection model with high accuracy
    """
    print("🔄 Generating synthetic network traffic data...")
    data = generate_synthetic_data(20000)  # Generate 20k samples
    
    print(f"📊 Dataset shape: {data.shape}")
    print(f"📊 Attack samples: {data['is_attack'].sum()}")
    print(f"📊 Normal samples: {len(data) - data['is_attack'].sum()}")
    
    # Features and target
    feature_columns = [
        'packet_rate', 'connection_duration', 'bytes_per_packet',
        'unique_source_ips', 'protocol_variety', 'syn_packet_ratio',
        'bandwidth_usage', 'connection_rate', 'ip_diversity_ratio'
    ]
    
    X = data[feature_columns]
    y = data['is_attack']
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print("🔧 Scaling features...")
    # Scale features for better performance
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Hyperparameter tuning
    print("🔍 Performing hyperparameter tuning...")
    param_grid = {
        'n_estimators': [100, 200, 300],
        'max_depth': [10, 15, 20, None],
        'min_samples_split': [2, 5, 10],
        'min_samples_leaf': [1, 2, 4],
        'max_features': ['sqrt', 'log2']
    }
    
    # Initial model for grid search
    rf = RandomForestClassifier(random_state=42, n_jobs=-1)
    
    # Grid search with cross-validation
    grid_search = GridSearchCV(
        rf, param_grid, cv=5, scoring='accuracy', 
        n_jobs=-1, verbose=1
    )
    
    grid_search.fit(X_train_scaled, y_train)
    
    # Best model
    best_rf = grid_search.best_estimator_
    
    print(f"🎯 Best parameters: {grid_search.best_params_}")
    print(f"🎯 Best CV score: {grid_search.best_score_:.4f}")
    
    # Train final model
    print("🚀 Training final model...")
    best_rf.fit(X_train_scaled, y_train)
    
    # Predictions
    y_pred = best_rf.predict(X_test_scaled)
    
    # Evaluation
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\n✅ Model Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
    
    # Cross-validation scores
    cv_scores = cross_val_score(best_rf, X_train_scaled, y_train, cv=5)
    print(f"📊 Cross-validation scores: {cv_scores}")
    print(f"📊 Mean CV accuracy: {cv_scores.mean():.4f} ± {cv_scores.std()*2:.4f}")
    
    # Detailed classification report
    print("\n📋 Classification Report:")
    print(classification_report(y_test, y_pred, 
                              target_names=['Normal', 'DDoS Attack']))
    
    # Confusion Matrix
    cm = confusion_matrix(y_test, y_pred)
    print(f"\n📊 Confusion Matrix:")
    print(cm)
    
    # Feature importance
    feature_importance = pd.DataFrame({
        'feature': feature_columns,
        'importance': best_rf.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("\n🔍 Feature Importance:")
    print(feature_importance)
    
    # Save model and scaler
    print("\n💾 Saving model and scaler...")
    joblib.dump(best_rf, 'enhanced_ddos_model.pkl')
    joblib.dump(scaler, 'feature_scaler.pkl')
    
    # Save feature columns for future use
    joblib.dump(feature_columns, 'feature_columns.pkl')
    
    print("✅ Enhanced DDoS detection model saved successfully!")
    print("📁 Files saved:")
    print("   - enhanced_ddos_model.pkl (trained model)")
    print("   - feature_scaler.pkl (feature scaler)")
    print("   - feature_columns.pkl (feature names)")
    
    # Visualization
    try:
        plt.figure(figsize=(12, 8))
        
        # Feature importance plot
        plt.subplot(2, 2, 1)
        sns.barplot(data=feature_importance, x='importance', y='feature')
        plt.title('Feature Importance')
        plt.xlabel('Importance Score')
        
        # Confusion matrix heatmap
        plt.subplot(2, 2, 2)
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                   xticklabels=['Normal', 'Attack'], 
                   yticklabels=['Normal', 'Attack'])
        plt.title('Confusion Matrix')
        plt.xlabel('Predicted')
        plt.ylabel('Actual')
        
        # Distribution of packet rates
        plt.subplot(2, 2, 3)
        data_sample = data.sample(n=2000, random_state=42)  # Sample for plotting
        sns.boxplot(data=data_sample, x='is_attack', y='packet_rate')
        plt.title('Packet Rate Distribution')
        plt.xlabel('Traffic Type (0=Normal, 1=Attack)')
        
        # Distribution of connection duration
        plt.subplot(2, 2, 4)
        sns.boxplot(data=data_sample, x='is_attack', y='connection_duration')
        plt.title('Connection Duration Distribution')
        plt.xlabel('Traffic Type (0=Normal, 1=Attack)')
        
        plt.tight_layout()
        plt.savefig('ddos_model_analysis.png', dpi=300, bbox_inches='tight')
        print("📊 Analysis plots saved as 'ddos_model_analysis.png'")
        
    except ImportError:
        print("⚠️  Matplotlib/Seaborn not available for plotting")
    
    return best_rf, scaler, feature_columns, accuracy

def test_model_prediction():
    """
    Test the trained model with sample data
    """
    print("\n🧪 Testing model with sample predictions...")
    
    try:
        # Load saved components
        model = joblib.load('enhanced_ddos_model.pkl')
        scaler = joblib.load('feature_scaler.pkl')
        feature_columns = joblib.load('feature_columns.pkl')
        
        # Test samples
        test_samples = pd.DataFrame({
            'packet_rate': [45, 8000, 75, 12000, 25],
            'connection_duration': [15.2, 0.05, 8.7, 0.02, 25.1],
            'bytes_per_packet': [850, 150, 900, 100, 750],
            'unique_source_ips': [15, 2, 20, 1, 25],
            'protocol_variety': [0.8, 0.1, 0.9, 0.05, 0.7],
            'syn_packet_ratio': [0.2, 0.9, 0.15, 0.95, 0.1],
            'bandwidth_usage': [38250, 1200000, 67500, 1200000, 18750],
            'connection_rate': [2.96, 160000, 8.62, 600000, 0.996],
            'ip_diversity_ratio': [0.33, 0.00025, 0.267, 0.000083, 1.0]
        })
        
        # Scale features
        test_scaled = scaler.transform(test_samples)
        
        # Predict
        predictions = model.predict(test_scaled)
        probabilities = model.predict_proba(test_scaled)
        
        print("\n🎯 Prediction Results:")
        for i, (pred, prob) in enumerate(zip(predictions, probabilities)):
            traffic_type = "DDoS Attack" if pred == 1 else "Normal Traffic"
            confidence = max(prob) * 100
            print(f"Sample {i+1}: {traffic_type} (Confidence: {confidence:.1f}%)")
            
    except FileNotFoundError:
        print("❌ Model files not found. Please train the model first.")

if __name__ == "__main__":
    print("🚀 Starting Enhanced DDoS Detection Model Training")
    print("=" * 60)
    
    # Train the model
    model, scaler, features, accuracy = train_enhanced_model()
    
    # Test predictions
    test_model_prediction()
    
    print(f"\n🎉 Training completed! Final accuracy: {accuracy*100:.2f}%")
    
    if accuracy >= 0.99:
        print("🏆 Target accuracy of 99%+ achieved!")
    else:
        print("⚠️  Consider increasing dataset size or adjusting hyperparameters for 99%+ accuracy")