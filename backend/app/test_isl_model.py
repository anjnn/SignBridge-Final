import cv2
import mediapipe as mp
import numpy as np
import os
import sys

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.append(CURRENT_DIR)

from isl_model import ISLModel, extract_isl_features

# ==========================================
# LOAD ISL MODEL
# ==========================================
print("========================================")
print("INDIAN SIGN LANGUAGE (ISL) LIVE TEST")
print("========================================")

isl_model = ISLModel()
print("✓ ISL Model loaded successfully!")
print(f"Classes ({len(isl_model.classes_)}): {list(isl_model.classes_)}")

# ==========================================
# MEDIAPIPE HANDS (max 2 hands)
# ==========================================
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=2,
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
print("Show an ISL sign (supports both 1-handed and 2-handed signs).")
print("Press Q to quit.\n")

while True:
    success, frame = cap.read()
    if not success:
        print("Could not read webcam frame")
        break

    # Mirror the webcam feed
    frame = cv2.flip(frame, 1)
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    results = hands.process(rgb_frame)

    prediction = "No hand detected"
    confidence_text = ""
    hands_text = ""

    if results.multi_hand_landmarks:
        # Draw skeletons for all detected hands
        for hand_lms in results.multi_hand_landmarks:
            mp_drawing.draw_landmarks(
                frame,
                hand_lms,
                mp_hands.HAND_CONNECTIONS
            )

        candidates = extract_isl_features(results.multi_hand_landmarks)

        if candidates:
            best_confidence = -1.0
            best_probs = None

            for cand in candidates:
                probs = isl_model.predict_proba(cand)[0]
                conf = float(np.max(probs))
                if conf > best_confidence:
                    best_confidence = conf
                    best_probs = probs

            best_index = int(np.argmax(best_probs))
            raw_pred = str(isl_model.classes_[best_index])

            num_hands = len(results.multi_hand_landmarks)
            hands_text = f"Hands detected: {num_hands}"

            if best_confidence < 0.35:
                prediction = "Uncertain"
            else:
                prediction = raw_pred

            confidence_text = f"Confidence: {best_confidence * 100:.1f}%"

    # Display HUD
    cv2.putText(
        frame,
        f"ISL Sign: {prediction}",
        (20, 50),
        cv2.FONT_HERSHEY_SIMPLEX,
        1.1,
        (0, 255, 0),
        3
    )

    if confidence_text:
        cv2.putText(
            frame,
            confidence_text,
            (20, 90),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 255, 255),
            2
        )

    if hands_text:
        cv2.putText(
            frame,
            hands_text,
            (20, 125),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (200, 200, 200),
            2
        )

    cv2.putText(
        frame,
        "Press Q to quit",
        (20, 160),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.5,
        (180, 180, 180),
        1
    )

    cv2.imshow("Indian Sign Language (ISL) Recognition", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
hands.close()
cv2.destroyAllWindows()
print("\nISL test completed.")

