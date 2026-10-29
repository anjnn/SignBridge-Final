import os
import sys
import base64
import numpy as np
import cv2
import joblib
import mediapipe as mp
from flask import Flask, request, jsonify
from flask_cors import CORS

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.append(CURRENT_DIR)

from landmark_utils import normalize_landmarks
from isl_model import ISLModel, extract_isl_features

app = Flask(__name__)
# Enable CORS for all routes
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ==========================================
# 1. LOAD TRAINED ASL MODEL (Random Forest)
# ==========================================
ASL_MODEL_PATH = os.path.join(CURRENT_DIR, "sign_model.pkl")

asl_model = None
if os.path.exists(ASL_MODEL_PATH):
    try:
        asl_model = joblib.load(ASL_MODEL_PATH)
        print("✓ ASL Random Forest Model loaded successfully!")
        print(f"  Classes ({len(asl_model.classes_)}): {list(asl_model.classes_)}")
    except Exception as e:
        print(f"✗ Error loading ASL model: {e}")
else:
    print(f"✗ ASL Model file not found at: {ASL_MODEL_PATH}")

# ==========================================
# 2. LOAD TRAINED ISL MODEL (Dual-Hand Deep Neural Network)
# ==========================================
isl_model = None
try:
    isl_model = ISLModel()
    print("✓ ISL Deep Neural Network Model loaded successfully!")
    print(f"  Classes ({len(isl_model.classes_)}): {list(isl_model.classes_)}")
except Exception as e:
    print(f"✗ Error loading ISL model: {e}")

# ==========================================
# 3. MEDIAPIPE HANDS DETECTOR
# max_num_hands=2 to support both single-hand (ASL/ISL) and dual-hand (ISL) gestures
# ==========================================
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=True,
    max_num_hands=2,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)


@app.route("/", methods=["GET"])
@app.route("/api/health", methods=["GET"])
def health_check():
    """Health check endpoint to verify backend status and loaded models."""
    return jsonify({
        "status": "online",
        "service": "Multilingual Sign Language Interpreter API",
        "asl_model_loaded": asl_model is not None,
        "isl_model_loaded": isl_model is not None,
        "supported_languages": ["asl", "isl"],
        "asl_classes": list(asl_model.classes_) if asl_model is not None else [],
        "isl_classes": list(isl_model.classes_) if isl_model is not None else []
    })


@app.route("/api/predict", methods=["POST"])
def predict():
    """
    Accepts webcam frame as base64 JPEG from React frontend.
    Extracts hand landmarks using MediaPipe (up to 2 hands).
    Routes to:
      - ASL Model: Evaluates single-hand landmarks with bilateral symmetry.
      - ISL Model: Evaluates 126-dim dual-hand coordinate vectors across permutations.
    Returns 21 or 42 hand landmarks, predicted sign, confidence, and top alternatives.
    """
    payload = request.get_json(silent=True)
    if not payload:
        return jsonify({
            "error": "Invalid JSON payload.",
            "detected": False
        }), 400

    language = payload.get("language", "asl").lower()
    image_b64 = payload.get("image", "")

    if not image_b64:
        return jsonify({
            "error": "No image data provided.",
            "detected": False
        }), 400

    if language == "asl" and asl_model is None:
        return jsonify({
            "error": "ASL model is not loaded on server.",
            "detected": False
        }), 500

    if language == "isl" and isl_model is None:
        return jsonify({
            "error": "ISL model is not loaded on server.",
            "detected": False
        }), 500

    try:
        # Strip Data URL header if present (e.g., 'data:image/jpeg;base64,...')
        if "," in image_b64:
            image_b64 = image_b64.split(",", 1)[1]

        image_bytes = base64.b64decode(image_b64)
        np_arr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if frame is None:
            return jsonify({
                "error": "Failed to decode image.",
                "detected": False
            }), 400

        # Convert BGR to RGB for MediaPipe
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(rgb_frame)

        if not results.multi_hand_landmarks:
            prompt_msg = (
                "No hand detected. Please hold one or both hands clearly in front of the camera."
                if language == "isl"
                else "No hand detected. Please hold your hand clearly in front of the camera."
            )
            return jsonify({
                "detected": False,
                "prediction": "",
                "confidence": None,
                "landmarks": [],
                "message": prompt_msg
            })

        # Flatten all detected hand landmarks (21 points per hand, up to 42 total)
        landmarks_list = []
        for hand_lms in results.multi_hand_landmarks:
            for lm in hand_lms.landmark:
                landmarks_list.append({
                    "x": round(float(lm.x), 4),
                    "y": round(float(lm.y), 4),
                    "z": round(float(lm.z), 4)
                })

        # Handedness labels
        handedness_list = []
        if results.multi_handedness:
            handedness_list = [c.classification[0].label for c in results.multi_handedness]
        handedness_str = ", ".join(handedness_list) if handedness_list else "Detected"

        num_hands = len(results.multi_hand_landmarks)

        # ----------------------------------------------------
        # BRANCH 1: INDIAN SIGN LANGUAGE (ISL) PREDICTION
        # ----------------------------------------------------
        if language == "isl":
            candidates = extract_isl_features(results.multi_hand_landmarks)

            if not candidates:
                return jsonify({
                    "detected": False,
                    "prediction": "",
                    "confidence": None,
                    "landmarks": landmarks_list,
                    "message": "Unable to extract ISL features from detected hand(s)."
                })

            best_probs = None
            best_confidence = -1.0

            # Evaluate each orientation / hand-permutation candidate
            for cand in candidates:
                probs = isl_model.predict_proba(cand)[0]
                conf = float(np.max(probs))
                if conf > best_confidence:
                    best_confidence = conf
                    best_probs = probs

            best_index = int(np.argmax(best_probs))
            prediction = str(isl_model.classes_[best_index])

            # Top 3 alternatives
            top_indices = np.argsort(best_probs)[::-1][:3]
            top3 = [
                {"sign": str(isl_model.classes_[idx]), "confidence": round(float(best_probs[idx]), 3)}
                for idx in top_indices
            ]

            # Confidence threshold for 26-class neural net
            is_uncertain = best_confidence < 0.35
            display_pred = "?" if is_uncertain else prediction
            hands_label = "1 hand" if num_hands == 1 else "2 hands"

            status_message = (
                f"ISL hand(s) detected ({hands_label}), but sign is uncertain. Hold steady."
                if is_uncertain
                else f"ISL Sign '{display_pred}' detected ({int(best_confidence * 100)}% match, {hands_label})"
            )

            return jsonify({
                "detected": True,
                "language": "isl",
                "prediction": display_pred,
                "confidence": round(best_confidence, 4),
                "landmarks": landmarks_list,
                "handedness": handedness_str,
                "num_hands": num_hands,
                "top3": top3,
                "message": status_message
            })

        # ----------------------------------------------------
        # BRANCH 2: AMERICAN SIGN LANGUAGE (ASL) PREDICTION
        # ----------------------------------------------------
        else:
            best_probs = None
            best_confidence = -1.0

            # Test each detected hand (with bilateral symmetry flip) to find strongest ASL match
            for hand_lms in results.multi_hand_landmarks:
                features_orig = normalize_landmarks(hand_lms)
                features_flipped = features_orig.copy()
                features_flipped[0::3] = -features_flipped[0::3]

                probs_orig = asl_model.predict_proba([features_orig])[0]
                probs_flip = asl_model.predict_proba([features_flipped])[0]

                conf_orig = float(np.max(probs_orig))
                conf_flip = float(np.max(probs_flip))

                if conf_orig > best_confidence:
                    best_confidence = conf_orig
                    best_probs = probs_orig

                if conf_flip > best_confidence:
                    best_confidence = conf_flip
                    best_probs = probs_flip

            best_index = int(np.argmax(best_probs))
            prediction = str(asl_model.classes_[best_index])

            top_indices = np.argsort(best_probs)[::-1][:3]
            top3 = [
                {"sign": str(asl_model.classes_[idx]), "confidence": round(float(best_probs[idx]), 3)}
                for idx in top_indices
            ]

            is_uncertain = best_confidence < 0.38
            display_pred = "?" if is_uncertain else prediction
            status_message = (
                "Hand detected, but sign is uncertain. Hold steady."
                if is_uncertain
                else f"ASL Sign '{display_pred}' detected ({int(best_confidence * 100)}% match)"
            )

            return jsonify({
                "detected": True,
                "language": "asl",
                "prediction": display_pred,
                "confidence": round(best_confidence, 4),
                "landmarks": landmarks_list,
                "handedness": handedness_str,
                "num_hands": num_hands,
                "top3": top3,
                "message": status_message
            })

    except Exception as exc:
        print(f"Error in prediction handler: {exc}")
        return jsonify({
            "error": str(exc),
            "detected": False
        }), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"\n=======================================================")
    print(f"🚀 Multilingual Sign Language Backend on http://127.0.0.1:{port}")
    print(f"   Supported Languages: ASL (26 Classes) & ISL (26 Classes, Dual-Hand)")
    print(f"=======================================================\n")
    app.run(host="127.0.0.1", port=port, debug=False)
