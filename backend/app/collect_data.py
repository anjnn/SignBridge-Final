import cv2
import mediapipe as mp
import csv
import os
from landmark_utils import normalize_landmarks


# -----------------------------
# Settings
# -----------------------------

DATASET_DIR = "dataset"
SAMPLES_PER_CLASS = 200

os.makedirs(DATASET_DIR, exist_ok=True)


# -----------------------------
# MediaPipe Hands
# -----------------------------

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)


# -----------------------------
# Ask for sign
# -----------------------------

label = input("Enter sign label (A-Z): ").upper()

if len(label) != 1 or not label.isalpha():
    print("Please enter only one letter from A-Z.")
    hands.close()
    exit()


# -----------------------------
# Dataset file
# -----------------------------

file_path = os.path.join(
    DATASET_DIR,
    f"{label}.csv"
)

file_exists = os.path.exists(file_path)

file = open(
    file_path,
    "a",
    newline=""
)

writer = csv.writer(file)


# -----------------------------
# Open webcam
# -----------------------------

cap = cv2.VideoCapture(0)

count = 0

print()
print(f"Collecting data for: {label}")
print(f"Target samples: {SAMPLES_PER_CLASS}")
print("Press Q to stop.")
print()


while cap.isOpened() and count < SAMPLES_PER_CLASS:

    success, frame = cap.read()

    if not success:
        print("Could not access webcam.")
        break

    # Mirror camera
    frame = cv2.flip(frame, 1)

    # Convert BGR → RGB
    rgb_frame = cv2.cvtColor(
        frame,
        cv2.COLOR_BGR2RGB
    )

    # Detect hand
    results = hands.process(rgb_frame)

    if results.multi_hand_landmarks:

        hand_landmarks = results.multi_hand_landmarks[0]

        # Draw landmarks
        mp_drawing.draw_landmarks(
            frame,
            hand_landmarks,
            mp_hands.HAND_CONNECTIONS
        )

        # Normalize landmarks
        features = normalize_landmarks(
            hand_landmarks
        )

        # Save data
        writer.writerow(
            list(features) + [label]
        )

        count += 1

    # Display information
    cv2.putText(
        frame,
        f"Sign: {label}",
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        1,
        (0, 255, 0),
        2
    )

    cv2.putText(
        frame,
        f"Samples: {count}/{SAMPLES_PER_CLASS}",
        (20, 80),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (0, 255, 0),
        2
    )

    cv2.imshow(
        "Sign Language Dataset Collection",
        frame
    )

    # Press Q to stop
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break


# -----------------------------
# Cleanup
# -----------------------------

file.close()
cap.release()
cv2.destroyAllWindows()
hands.close()

print()
print(f"Finished collecting {count} samples for {label}.")
print(f"Saved to: {file_path}")