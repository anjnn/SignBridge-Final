import cv2
import mediapipe as mp
import joblib
import numpy as np
import os

from landmark_utils import normalize_landmarks


# ==========================================
# LOAD TRAINED MODEL
# ==========================================

MODEL_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "sign_model.pkl"
)

model = joblib.load(MODEL_PATH)

print("========================================")
print("ASL A-Z LIVE TEST")
print("========================================")
print("Model loaded successfully!")
print("Classes:", model.classes_)


# ==========================================
# MEDIAPIPE HANDS
# ==========================================

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)


# ==========================================
# OPEN WEBCAM
# ==========================================

cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("ERROR: Could not access webcam")
    exit()

print("\nWebcam started!")
print("Show an ASL alphabet sign.")
print("Press Q to quit.")


# ==========================================
# LIVE PREDICTION
# ==========================================

while True:

    success, frame = cap.read()

    if not success:
        print("Could not read webcam frame")
        break

    # Mirror the webcam
    frame = cv2.flip(frame, 1)

    # Convert BGR → RGB
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Detect hand
    results = hands.process(rgb_frame)

    prediction = "No hand detected"
    confidence_text = ""

    if results.multi_hand_landmarks:

        hand_landmarks = results.multi_hand_landmarks[0]

        # Draw hand landmarks
        mp_drawing.draw_landmarks(
            frame,
            hand_landmarks,
            mp_hands.HAND_CONNECTIONS
        )

        # Extract 63 normalized features
        features = normalize_landmarks(hand_landmarks)

        # Convert to model input format
        features = np.array(features).reshape(1, -1)

        # Predict letter
        prediction = model.predict(features)[0]

        # Get model vote probability
        probabilities = model.predict_proba(features)[0]

        confidence = np.max(probabilities)

        confidence_text = f"Confidence: {confidence * 100:.1f}%"

        # Optional confidence threshold
        if confidence < 0.60:
            prediction = "Uncertain"


    # ==========================================
    # DISPLAY RESULT
    # ==========================================

    cv2.putText(
        frame,
        f"Prediction: {prediction}",
        (20, 50),
        cv2.FONT_HERSHEY_SIMPLEX,
        1.1,
        (0, 255, 0),
        3
    )

    cv2.putText(
        frame,
        confidence_text,
        (20, 90),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (0, 255, 255),
        2
    )

    cv2.putText(
        frame,
        "Press Q to quit",
        (20, 125),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.6,
        (255, 255, 255),
        2
    )

    cv2.imshow("ASL A-Z Recognition", frame)


    # ==========================================
    # EXIT
    # ==========================================

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break


# ==========================================
# CLEANUP
# ==========================================

cap.release()
hands.close()
cv2.destroyAllWindows()

print("\nTest completed.")