# Multilingual Real-Time Sign Language Interpreter (ASL & ISL)

An AI-powered multilingual sign language interpreter that recognizes alphabet signs from webcam feeds in real time using **MediaPipe 21-point dual-hand landmarks** and **Deep Learning / Random Forest models**.

---

## ⚡ The "One Link & One Command" Quickstart

### 1. Run Everything With One Command
In your terminal, simply run:

```bash
npm run dev
```

*(This automatically starts both the Python Flask Backend and the Vite React Frontend together!)*

### 2. Open The Single Link
Open your browser and navigate to:

👉 **[http://localhost:5173](http://localhost:5173)**

*(Vite automatically proxies all `/api` requests to the Python backend on port 5000, so you only ever need this single link!)*

---

## 🌟 Supported Sign Languages

### 1. 🤟 American Sign Language (ASL - 26 Classes A–Z)
- **Model:** Pretrained Random Forest Classifier (`sign_model.pkl`).
- **Input:** 63-dimensional normalized hand landmark feature vector.
- **Orientation:** Bilateral symmetry evaluation (supports both Left and Right hands seamlessly in mirrored or unmirrored webcams).

### 2. 🇮🇳 Indian Sign Language (ISL - 26 Classes A–Z)
- **Model:** Pretrained Deep Neural Network (`isl_model.py` + `isl_mediapipe.weights.h5`).
- **Input:** 126-dimensional dual-hand coordinate feature vector (63 features per hand, padded if single-handed).
- **Dual-Hand Tracking:** Tracks up to two hands simultaneously with dual neon skeletons (Cyan for Hand 1, Violet for Hand 2).
- **Permutation Invariance:** Evaluates multiple hand orderings and orientations to deliver maximum prediction confidence.

---

## 🌟 Key Features

1. **Dual-Hand 21+21 Landmarks Skeleton Overlay:**
   - Real-time visual tracking renders neon cyan skeletal connections for Hand 1 and neon purple connections for Hand 2.
   - Distinct colored dots for fingertips (orange/pink), wrists, and knuckles (green/lime).
2. **Instant Language Switching:**
   - Seamlessly toggle between ASL and ISL in the web UI.
3. **Interactive Visual Reference Drawers:**
   - Context-aware Alphabet Guides for both ASL and ISL describing finger shapes and combinations.
4. **Top 3 Candidate Visibility:**
   - Real-time confidence score with top 3 alternative candidate predictions.
5. **Mirror Camera Toggle:**
   - Switch between mirrored (selfie mode) and normal camera view with one click.

---

## 📁 Project Architecture

```text
full project/
├── frontend/                     # React 19 + Vite + Tailwind CSS UI
│   ├── src/
│   │   ├── components/           # Navbar, Hero, Features, etc.
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Landing page
│   │   │   └── Recognizer.jsx    # Live webcam sign recognition (ASL & ISL)
│   │   ├── App.jsx & index.css
│   ├── index.html
│   ├── vite.config.js            # Proxies /api to http://127.0.0.1:5000
│   └── package.json
│
├── backend/                      # Python ML & Server
│   ├── app/
│   │   ├── server.py             # Flask API (/api/predict, /api/health)
│   │   ├── isl_model.py          # 26-class ISL Deep Neural Network (NumPy engine)
│   │   ├── isl_mediapipe.weights.h5 # Pretrained ISL network weights
│   │   ├── sign_model.pkl        # Pretrained ASL Random Forest model
│   │   ├── landmark_utils.py     # 21-point hand landmark normalizer
│   │   ├── test_model.py         # Standalone desktop OpenCV test for ASL
│   │   ├── test_isl_model.py     # Standalone desktop OpenCV test for ISL
│   │   ├── collect_data.py       # ASL dataset collection tool
│   │   └── collect_isl_data.py   # ISL dual-hand dataset collection tool
│   ├── dataset/
│   │   └── asl_hg/               # 26 Alphabet CSV datasets (A.csv - Z.csv)
│   ├── requirements.txt          # Python dependencies
│   └── .venv/                    # Python virtual environment
│
├── start.js                      # Unified runner script
├── package.json                  # Root scripts (npm run dev, npm start, etc.)
└── README.md
```

---

## 🖐️ Individual Run Commands (If Running Separately)

- **Start Unified App:** `npm run dev`
- **Start Backend Only:** `npm run start:backend`
- **Start Frontend Only:** `npm run dev:frontend`
- **Standalone Desktop OpenCV Test (ASL):** `npm run test:model`
- **Standalone Desktop OpenCV Test (ISL):** `npm run test:isl`
- **Collect ISL Data:** `npm run collect:isl`
