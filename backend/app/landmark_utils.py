import numpy as np


def normalize_landmarks(hand_landmarks):
    """
    Convert MediaPipe's 21 hand landmarks
    into a normalized 63-value feature vector.
    """

    landmarks = []

    # Convert landmarks to numpy array
    for landmark in hand_landmarks.landmark:
        landmarks.append([
            landmark.x,
            landmark.y,
            landmark.z
        ])

    landmarks = np.array(landmarks)

    # Use wrist (landmark 0) as the reference point
    wrist = landmarks[0].copy()

    # Make wrist the origin
    landmarks = landmarks - wrist

    # Find the largest distance from the wrist
    max_distance = np.max(np.linalg.norm(landmarks, axis=1))

    # Avoid division by zero
    if max_distance > 0:
        landmarks = landmarks / max_distance

    # Convert 21 × 3 into one 63-value array
    features = landmarks.flatten()

    return features