from flask import Flask, request, jsonify
import joblib
import numpy as np
import pandas as pd
import logging
from datetime import datetime
import traceback

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

class DDoSDetectionServer:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.feature_columns = None
        self.load_model_components()
    
    def load_model_components(self):
        """Load all model components"""
        try:
            logger.info("Loading model components...")
            self.model = joblib.load('enhanced_ddos_model.pkl')
            self.scaler = joblib.load('feature_scaler.pkl')
            self.feature_columns = joblib.load('feature_columns.pkl')
            logger.info("✅ All model components loaded successfully")
            logger.info(f"Features: {self.feature_columns}")
        except FileNotFoundError as e:
            logger.error(f"❌ Model files not found: {e}")
            logger.error("Please run the training script first to generate model files")
            raise
        except Exception as e:
            logger.error(f"❌ Error loading model: {e}")
            raise
    
    def validate_input(self, data):
        """Validate input data"""
        required_fields = [
            'packet_rate', 'connection_duration', 'bytes_per_packet',
            'unique_source_ips', 'protocol_variety', 'syn_packet_ratio'
        ]
        
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return False, f"Missing required fields: {missing_fields}"
        
        # Check for negative values where they shouldn't be
        non_negative_fields = ['packet_rate', 'connection_duration', 'bytes_per_packet', 'unique_source_ips']
        for field in non_negative_fields:
            if data[field] < 0:
                return False, f"Field {field} cannot be negative"
        
        # Check for valid ranges
        if not (0 <= data['protocol_variety'] <= 1):
            return False, "protocol_variety must be between 0 and 1"
        
        if not (0 <= data['syn_packet_ratio'] <= 1):
            return False, "syn_packet_ratio must be between 0 and 1"
        
        return True, "Valid"
    
    def engineer_features(self, data):
        """Engineer additional features from basic input"""
        # Calculate derived features
        bandwidth_usage = data['packet_rate'] * data['bytes_per_packet']
        connection_rate = data['packet_rate'] / (data['connection_duration'] + 0.001)  # Avoid division by zero
        ip_diversity_ratio = data['unique_source_ips'] / (data['packet_rate'] + 1)
        
        # Create complete feature vector
        features = {
            'packet_rate': data['packet_rate'],
            'connection_duration': data['connection_duration'],
            'bytes_per_packet': data['bytes_per_packet'],
            'unique_source_ips': data['unique_source_ips'],
            'protocol_variety': data['protocol_variety'],
            'syn_packet_ratio': data['syn_packet_ratio'],
            'bandwidth_usage': bandwidth_usage,
            'connection_rate': connection_rate,
            'ip_diversity_ratio': ip_diversity_ratio
        }
        
        return features
    
    def predict(self, data):
        """Make prediction with confidence score"""
        try:
            # Validate input
            is_valid, message = self.validate_input(data)
            if not is_valid:
                raise ValueError(message)
            
            # Engineer features
            engineered_features = self.engineer_features(data)
            
            # Create feature vector in correct order
            feature_vector = [engineered_features[col] for col in self.feature_columns]
            feature_array = np.array([feature_vector])
            
            # Scale features
            feature_scaled = self.scaler.transform(feature_array)
            
            # Make prediction
            prediction = self.model.predict(feature_scaled)[0]
            probabilities = self.model.predict_proba(feature_scaled)[0]
            
            # Get confidence score
            confidence = max(probabilities)
            attack_probability = probabilities[1]  # Probability of being an attack
            
            return {
                'prediction': int(prediction),
                'attack': bool(prediction),
                'confidence': float(confidence),
                'attack_probability': float(attack_probability),
                'normal_probability': float(probabilities[0]),
                'risk_level': self.get_risk_level(attack_probability)
            }
            
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            raise

    def get_risk_level(self, attack_prob):
        """Determine risk level based on attack probability"""
        if attack_prob >= 0.9:
            return "CRITICAL"
        elif attack_prob >= 0.7:
            return "HIGH"
        elif attack_prob >= 0.4:
            return "MEDIUM"
        elif attack_prob >= 0.2:
            return "LOW"
        else:
            return "MINIMAL"

# Initialize the detection server
try:
    detection_server = DDoSDetectionServer()
except Exception as e:
    logger.error(f"Failed to initialize server: {e}")
    detection_server = None

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    if detection_server is None:
        return jsonify({
            'status': 'unhealthy',
            'message': 'Model not loaded'
        }), 500
    
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'model_loaded': True
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Enhanced prediction endpoint"""
    if detection_server is None:
        return jsonify({
            'error': 'Model not loaded',
            'message': 'Please check server logs and ensure model files exist'
        }), 500
    
    try:
        # Get JSON data
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No data provided',
                'message': 'Please provide JSON data in request body'
            }), 400
        
        # Log request (remove sensitive data if needed)
        logger.info(f"Prediction request received: packet_rate={data.get('packet_rate')}")
        
        # Make prediction
        result = detection_server.predict(data)
        
        # Add metadata
        response = {
            'timestamp': datetime.now().isoformat(),
            'prediction': result,
            'input_features': len(detection_server.feature_columns)
        }
        
        # Log result
        attack_status = "ATTACK" if result['attack'] else "NORMAL"
        logger.info(f"Prediction: {attack_status} (confidence: {result['confidence']:.3f})")
        
        return jsonify(response)
        
    except ValueError as e:
        logger.warning(f"Validation error: {e}")
        return jsonify({
            'error': 'Invalid input',
            'message': str(e)
        }), 400
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        logger.error(traceback.format_exc())
        return jsonify({
            'error': 'Internal server error',
            'message': 'An error occurred during prediction'
        }), 500

@app.route('/features', methods=['GET'])
def get_features():
    """Get required features for prediction"""
    if detection_server is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    required_features = [
        {
            'name': 'packet_rate',
            'description': 'Number of packets per second',
            'type': 'float',
            'range': '> 0'
        },
        {
            'name': 'connection_duration',
            'description': 'Duration of connection in seconds',
            'type': 'float',
            'range': '> 0'
        },
        {
            'name': 'bytes_per_packet',
            'description': 'Average bytes per packet',
            'type': 'float',
            'range': '> 0'
        },
        {
            'name': 'unique_source_ips',
            'description': 'Number of unique source IP addresses',
            'type': 'integer',
            'range': '>= 1'
        },
        {
            'name': 'protocol_variety',
            'description': 'Protocol diversity score (0-1)',
            'type': 'float',
            'range': '0.0 - 1.0'
        },
        {
            'name': 'syn_packet_ratio',
            'description': 'Ratio of SYN packets (0-1)',
            'type': 'float',
            'range': '0.0 - 1.0'
        }
    ]
    
    return jsonify({
        'required_features': required_features,
        'total_features': len(detection_server.feature_columns),
        'engineered_features': ['bandwidth_usage', 'connection_rate', 'ip_diversity_ratio']
    })

@app.route('/example', methods=['GET'])
def get_example():
    """Get example request data"""
    examples = {
        'normal_traffic': {
            'packet_rate': 45.0,
            'connection_duration': 15.2,
            'bytes_per_packet': 850.0,
            'unique_source_ips': 15,
            'protocol_variety': 0.8,
            'syn_packet_ratio': 0.2
        },
        'ddos_attack': {
            'packet_rate': 8000.0,
            'connection_duration': 0.05,
            'bytes_per_packet': 150.0,
            'unique_source_ips': 2,
            'protocol_variety': 0.1,
            'syn_packet_ratio': 0.9
        }
    }
    
    return jsonify({
        'examples': examples,
        'usage': 'POST /predict with JSON body containing the required features'
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'error': 'Endpoint not found',
        'available_endpoints': ['/predict', '/health', '/features', '/example']
    }), 404

@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({
        'error': 'Method not allowed',
        'message': 'Check the HTTP method and endpoint'
    }), 405

if __name__ == '__main__':
    print("🚀 Starting Enhanced DDoS Detection Server")
    print("=" * 50)
    
    if detection_server is None:
        print("❌ Server failed to initialize")
        print("Please run the training script first to generate model files:")
        print("python enhanced_ddos_training.py")
    else:
        print("✅ Server initialized successfully")
        print("\n📍 Available endpoints:")
        print("  POST /predict    - Make predictions")
        print("  GET  /health     - Health check")
        print("  GET  /features   - Get required features")
        print("  GET  /example    - Get example requests")
        print(f"\n🌐 Server running on http://localhost:5001")
        
        app.run(host='0.0.0.0', port=5001, debug=True)