import cv2
import mediapipe as mp
import os
import csv

from landmark_utils import normalize_landmarks


# ==============================
# PATHS
# ==============================

SOURCE_DIR = r"C:\ASL\asl_dataset"

OUTPUT_DIR = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..",
    "dataset"
)

os.makedirs(OUTPUT_DIR, exist_ok=True)


# ==============================
# MEDIAPIPE
# ==============================

mp_hands = mp.solutions.hands

hands = mp_hands.Hands(
    static_image_mode=True,
    max_num_hands=1,
    min_detection_confidence=0.5
)


# ==============================
# PROCESS ONLY A
# ==============================

letter = "A"

input_folder = os.path.join(SOURCE_DIR, letter)
output_file = os.path.join(OUTPUT_DIR, f"{letter}.csv")

print("================================")
print("Processing ASL-HG letter A")
print("================================")
print("Input:", input_folder)
print("Output:", output_file)


processed = 0
skipped = 0


with open(output_file, "w", newline="") as csvfile:

    writer = csv.writer(csvfile)

    for filename in os.listdir(input_folder):

        image_path = os.path.join(input_folder, filename)

        if not filename.lower().endswith(
            (".jpg", ".jpeg", ".png")
        ):
            continue

        image = cv2.imread(image_path)

        if image is None:
            skipped += 1
            continue

        rgb_image = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2RGB
        )

        results = hands.process(rgb_image)

        if not results.multi_hand_landmarks:
            skipped += 1
            continue

        hand_landmarks = results.multi_hand_landmarks[0]

        features = normalize_landmarks(hand_landmarks)

        features = features.tolist()

        features.append(letter)

        writer.writerow(features)

        processed += 1

        # Show progress
        if processed % 100 == 0:
            print(f"Processed: {processed}")


hands.close()


print("\n================================")
print("A EXTRACTION COMPLETED")
print("================================")
print("Processed:", processed)
print("Skipped:", skipped)
print("CSV:", output_file)