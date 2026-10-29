import os
import numpy as np
import h5py

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
WEIGHTS_PATH = os.path.join(CURRENT_DIR, "isl_mediapipe.weights.h5")


class ISLModel:
    """
    Lightweight, high-performance NumPy inference engine for the 
    26-class Indian Sign Language (ISL) Deep Neural Network.
    
    Architecture:
      Input (126,) -> Dense(256) -> BatchNorm -> ReLU -> Dropout(0.4)
                   -> Dense(256) -> BatchNorm -> ReLU -> Dropout(0.4)
                   -> Dense(128) -> BatchNorm -> ReLU -> Dropout(0.3)
                   -> Dense(64)  -> BatchNorm -> ReLU -> Dropout(0.2)
                   -> Dense(26)  -> Softmax
    """

    def __init__(self, weights_path=WEIGHTS_PATH):
        if not os.path.exists(weights_path):
            raise FileNotFoundError(f"ISL weights file not found: {weights_path}")

        with h5py.File(weights_path, "r") as f:
            # Layer 0: Dense(126, 256) + BatchNorm(256)
            self.d0_w = np.array(f["layers/dense/vars/0"], dtype=np.float32)
            self.d0_b = np.array(f["layers/dense/vars/1"], dtype=np.float32)
            self.bn0_gamma = np.array(f["layers/batch_normalization/vars/0"], dtype=np.float32)
            self.bn0_beta = np.array(f["layers/batch_normalization/vars/1"], dtype=np.float32)
            self.bn0_mean = np.array(f["layers/batch_normalization/vars/2"], dtype=np.float32)
            self.bn0_var = np.array(f["layers/batch_normalization/vars/3"], dtype=np.float32)

            # Layer 1: Dense(256, 256) + BatchNorm(256)
            self.d1_w = np.array(f["layers/dense_1/vars/0"], dtype=np.float32)
            self.d1_b = np.array(f["layers/dense_1/vars/1"], dtype=np.float32)
            self.bn1_gamma = np.array(f["layers/batch_normalization_1/vars/0"], dtype=np.float32)
            self.bn1_beta = np.array(f["layers/batch_normalization_1/vars/1"], dtype=np.float32)
            self.bn1_mean = np.array(f["layers/batch_normalization_1/vars/2"], dtype=np.float32)
            self.bn1_var = np.array(f["layers/batch_normalization_1/vars/3"], dtype=np.float32)

            # Layer 2: Dense(256, 128) + BatchNorm(128)
            self.d2_w = np.array(f["layers/dense_2/vars/0"], dtype=np.float32)
            self.d2_b = np.array(f["layers/dense_2/vars/1"], dtype=np.float32)
            self.bn2_gamma = np.array(f["layers/batch_normalization_2/vars/0"], dtype=np.float32)
            self.bn2_beta = np.array(f["layers/batch_normalization_2/vars/1"], dtype=np.float32)
            self.bn2_mean = np.array(f["layers/batch_normalization_2/vars/2"], dtype=np.float32)
            self.bn2_var = np.array(f["layers/batch_normalization_2/vars/3"], dtype=np.float32)

            # Layer 3: Dense(128, 64) + BatchNorm(64)
            self.d3_w = np.array(f["layers/dense_3/vars/0"], dtype=np.float32)
            self.d3_b = np.array(f["layers/dense_3/vars/1"], dtype=np.float32)
            self.bn3_gamma = np.array(f["layers/batch_normalization_3/vars/0"], dtype=np.float32)
            self.bn3_beta = np.array(f["layers/batch_normalization_3/vars/1"], dtype=np.float32)
            self.bn3_mean = np.array(f["layers/batch_normalization_3/vars/2"], dtype=np.float32)
            self.bn3_var = np.array(f["layers/batch_normalization_3/vars/3"], dtype=np.float32)

            # Layer 4: Dense(64, 26) Output logits
            self.d4_w = np.array(f["layers/dense_4/vars/0"], dtype=np.float32)
            self.d4_b = np.array(f["layers/dense_4/vars/1"], dtype=np.float32)

        self.classes_ = np.array([chr(c) for c in range(ord("A"), ord("Z") + 1)])
        self.eps = 1e-3

    def _bn_relu(self, x, gamma, beta, mean, var):
        # Batch normalization inference: y = gamma * ((x - mean) / sqrt(var + eps)) + beta
        norm = (x - mean) / np.sqrt(var + self.eps)
        scaled = gamma * norm + beta
        return np.maximum(0.0, scaled)

    def predict_proba(self, X):
        """
        Calculates softmax probabilities for feature array of shape (N, 126) or (126,).
        """
        x = np.asarray(X, dtype=np.float32)
        if x.ndim == 1:
            x = x.reshape(1, -1)

        # Forward pass through dense layers
        x = np.dot(x, self.d0_w) + self.d0_b
        x = self._bn_relu(x, self.bn0_gamma, self.bn0_beta, self.bn0_mean, self.bn0_var)

        x = np.dot(x, self.d1_w) + self.d1_b
        x = self._bn_relu(x, self.bn1_gamma, self.bn1_beta, self.bn1_mean, self.bn1_var)

        x = np.dot(x, self.d2_w) + self.d2_b
        x = self._bn_relu(x, self.bn2_gamma, self.bn2_beta, self.bn2_mean, self.bn2_var)

        x = np.dot(x, self.d3_w) + self.d3_b
        x = self._bn_relu(x, self.bn3_gamma, self.bn3_beta, self.bn3_mean, self.bn3_var)

        logits = np.dot(x, self.d4_w) + self.d4_b
        exp_logits = np.exp(logits - np.max(logits, axis=-1, keepdims=True))
        probs = exp_logits / np.sum(exp_logits, axis=-1, keepdims=True)
        return probs

    def predict(self, X):
        probs = self.predict_proba(X)
        indices = np.argmax(probs, axis=-1)
        return self.classes_[indices]


def extract_isl_features(multi_hand_landmarks):
    """
    Extracts 126-dimensional feature vector from MediaPipe multi_hand_landmarks.
    Supports both 1-hand (padded with 63 zeros) and 2-hand signs.
    Returns:
      A list of candidate feature vectors to test against the model:
      - Normal ordering [hand0, hand1]
      - Flipped ordering [hand1, hand0] (if 2 hands detected)
      - Mirrored horizontal versions (negating X) for both Left & Right dominance.
    """
    if not multi_hand_landmarks:
        return []

    # Process up to 2 hands
    hands_coords = []
    for hand_lms in multi_hand_landmarks[:2]:
        wrist = hand_lms.landmark[0]
        hand_vals = []
        for lm in hand_lms.landmark:
            hand_vals.extend([lm.x - wrist.x, lm.y - wrist.y, lm.z - wrist.z])

        hand_arr = np.array(hand_vals, dtype=np.float32)
        # Middle finger base MCP (index 9) distance for scale invariance
        scale = np.sqrt(hand_arr[9 * 3] ** 2 + hand_arr[9 * 3 + 1] ** 2)
        if scale > 0:
            hand_arr = hand_arr / scale

        hands_coords.append(hand_arr)

    # Pad if only 1 hand detected
    pad_hand = np.zeros(63, dtype=np.float32)

    candidates = []

    if len(hands_coords) == 1:
        # Candidate 1: [hand0, 0]
        vec1 = np.concatenate([hands_coords[0], pad_hand])
        candidates.append(vec1)

        # Mirrored horizontal (negate x relative to wrist)
        vec1_mirrored = vec1.copy()
        vec1_mirrored[0:63:3] = -vec1_mirrored[0:63:3]
        candidates.append(vec1_mirrored)

        # In case the model was trained with hand as second slot
        vec1_swapped = np.concatenate([pad_hand, hands_coords[0]])
        candidates.append(vec1_swapped)
        vec1_swapped_m = vec1_swapped.copy()
        vec1_swapped_m[63::3] = -vec1_swapped_m[63::3]
        candidates.append(vec1_swapped_m)

    else:
        # 2 hands detected: test both hand orders [h0, h1] and [h1, h0]
        h0, h1 = hands_coords[0], hands_coords[1]

        # Order 0-1
        vec_01 = np.concatenate([h0, h1])
        candidates.append(vec_01)

        # Order 1-0
        vec_10 = np.concatenate([h1, h0])
        candidates.append(vec_10)

        # Mirrored versions
        vec_01_m = vec_01.copy()
        vec_01_m[0::3] = -vec_01_m[0::3]
        candidates.append(vec_01_m)

        vec_10_m = vec_10.copy()
        vec_10_m[0::3] = -vec_10_m[0::3]
        candidates.append(vec_10_m)

    return candidates

