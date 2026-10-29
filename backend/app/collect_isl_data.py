import cv2
import mediapipe as mp
import csv
import os
import sys
import numpy as np

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.append(CURRENT_DIR)

# ==========================================
# SETTINGS
# ==========================================
DATASET_DIR = os.path.join(CURRENT_DIR, "..", "dataset", "isl")
SAMPLES_PER_CLASS = 150

os.makedirs(DATASET_DIR, exist_ok=True)

# ==========================================
# MEDIAPIPE (Up to 2 hands)
# ==========================================
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=2,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# Ask for label
label = input("Enter ISL sign label (A-Z): ").upper().strip()
if len(label) != 1 or not label.isalpha():
    print("Please enter a single letter from A to Z.")
    hands.close()
    exit()

file_path = os.path.join(DATASET_DIR, f"{label}.csv")
file = open(file_path, "a", newline="")
writer = csv.writer(file)

cap = cv2.VideoCapture(0)
count = 0

print(f"\nCollecting ISL data for: {label}")
print(f"Target samples: {SAMPLES_PER_CLASS}")
print("Supports 1 or 2 hands. Press Q to stop.\n")

while cap.isOpened() and count < SAMPLES_PER_CLASS:
    success, frame = cap.read()
    if not success:
        print("Could not access webcam.")
        break

    frame = cv2.flip(frame, 1)
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(rgb_frame)

    if results.multi_hand_landmarks:
        # Draw all hands
        for hand_lms in results.multi_hand_landmarks:
            mp_drawing.draw_landmarks(
                frame,
                hand_lms,
                mp_hands.HAND_CONNECTIONS
            )

        # Extract 126 features
        coords = []
        for hand_idx in range(2):
            if hand_idx < len(results.multi_hand_landmarks):
                lms = results.multi_hand_landmarks[hand_idx]
                wrist = lms.landmark[0]
                hand_vals = []
                for lm in lms.landmark:
                    hand_vals.extend([lm.x - wrist.x, lm.y - wrist.y, lm.z - wrist.z])
                hand_arr = np.array(hand_vals, dtype=np.float32)
                scale = np.sqrt(hand_arr[9 * 3] ** 2 + hand_arr[9 * 3 + 1] ** 2)
                if scale > 0:
                    hand_arr = hand_arr / scale
                coords.extend(hand_arr.tolist())
            else:
                coords.extend([0.0] * 63)

        writer.writerow(coords + [label])
        count += 1

    cv2.putText(
        frame,
        f"ISL Sign: {label} ({count}/{SAMPLES_PER_CLASS})",
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.9,
        (0, 255, 0),
        2
    )

    cv2.imshow("ISL Dataset Collection", frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

file.close()
cap.release()
cv2.destroyAllWindows()
hands.close()

print(f"\nFinished collecting {count} ISL samples for {label}.")
print(f"Saved to: {file_path}")

