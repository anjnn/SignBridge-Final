import pandas as pd
import glob
import os
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report


# ==========================================
# PATHS
# ==========================================

# Location of the ASL-HG CSV files
DATASET_DIR = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..",
    "dataset",
    "asl_hg"
)

# Location where the trained model will be saved
MODEL_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "sign_model.pkl"
)


# ==========================================
# FIND CSV FILES
# ==========================================

csv_files = sorted(
    glob.glob(os.path.join(DATASET_DIR, "*.csv"))
)

print("========================================")
print("ASL A-Z RANDOM FOREST TRAINING")
print("========================================")

print("\nDataset folder:")
print(DATASET_DIR)

print("\nCSV files found:", len(csv_files))

for file in csv_files:
    print(" -", os.path.basename(file))


# ==========================================
# CHECK DATASET
# ==========================================

if len(csv_files) != 26:
    print("\nWARNING!")
    print("Expected 26 alphabet CSV files.")
    print("Found:", len(csv_files))
    print("Check that A.csv through Z.csv exist.")

    exit()


# ==========================================
# LOAD DATA
# ==========================================

dataframes = []

print("\nLoading datasets...")

for file in csv_files:

    df = pd.read_csv(
        file,
        header=None
    )

    dataframes.append(df)

    print(
        f"{os.path.basename(file)} -> "
        f"{len(df)} samples"
    )


# Combine all letters
data = pd.concat(
    dataframes,
    ignore_index=True
)


# ==========================================
# DATASET INFORMATION
# ==========================================

print("\n========================================")
print("DATASET INFORMATION")
print("========================================")

print("Total samples:", len(data))
print("Total columns:", data.shape[1])
print("Number of features:", data.shape[1] - 1)


# ==========================================
# CHECK FEATURES
# ==========================================

if data.shape[1] != 64:

    print("\nERROR!")
    print(
        "Expected 64 columns "
        "(63 features + 1 label)."
    )

    print(
        "Found:",
        data.shape[1]
    )

    exit()


# ==========================================
# CLASS DISTRIBUTION
# ==========================================

print("\nSamples per class:")

print(
    data.iloc[:, -1].value_counts().sort_index()
)


# ==========================================
# SPLIT FEATURES AND LABEL
# ==========================================

X = data.iloc[:, :-1]

y = data.iloc[:, -1]


# ==========================================
# TRAIN / TEST SPLIT
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


print("\n========================================")
print("TRAIN / TEST SPLIT")
print("========================================")

print("Training samples:", len(X_train))
print("Testing samples:", len(X_test))


# ==========================================
# RANDOM FOREST
# ==========================================

print("\n========================================")
print("TRAINING RANDOM FOREST")
print("========================================")

model = RandomForestClassifier(
    n_estimators=200,
    random_state=42,
    n_jobs=-1
)


model.fit(
    X_train,
    y_train
)


print("Training completed!")


# ==========================================
# PREDICTION
# ==========================================

y_pred = model.predict(X_test)


# ==========================================
# ACCURACY
# ==========================================

accuracy = accuracy_score(
    y_test,
    y_pred
)


print("\n========================================")
print("MODEL PERFORMANCE")
print("========================================")

print(
    f"Accuracy: {accuracy:.4f}"
)

print(
    f"Accuracy percentage: {accuracy * 100:.2f}%"
)


# ==========================================
# CLASSIFICATION REPORT
# ==========================================

print("\nClassification Report:")

print(
    classification_report(
        y_test,
        y_pred
    )
)


# ==========================================
# SAVE MODEL
# ==========================================

joblib.dump(
    model,
    MODEL_PATH
)


print("\n========================================")
print("MODEL SAVED")
print("========================================")

print(
    "Model:",
    MODEL_PATH
)

print("\nClasses learned by model:")

print(
    model.classes_
)

print("\nA-Z training completed successfully!")