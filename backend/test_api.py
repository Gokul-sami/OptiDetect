import os
import requests

URL = "http://127.0.0.1:8000/predict/leukocoria"

BASE = r"C:\Users\gokul\Downloads\leucare_test_images"

classes = {
    "healthy_eye": 0,
    "leukocoria": 1
}

correct = 0
total = 0
predicted_count = 0
not_predicted_count = 0
MAX_PER_FOLDER = 50

for folder, label in classes.items():

    path = os.path.join(BASE, folder)
    if not os.path.isdir(path):
        print("Missing folder:", path)
        continue

    processed = 0
    for file in os.listdir(path):
        if processed >= MAX_PER_FOLDER:
            break

        if not file.lower().endswith((".jpg", ".jpeg", ".png")):
            continue

        with open(os.path.join(path, file), "rb") as f:
            r = requests.post(URL, files={"file": f})

        result = r.json()

        prediction = result.get("prediction")
        if prediction is None:
            not_predicted_count += 1
            print(file, "→", "NO_PREDICTION", result)
            continue

        predicted_count += 1

        pred = 1 if prediction == "LEUKOCORIA" else 0

        if pred == label:
            correct += 1

        total += 1

        print(file, "→", prediction, result.get("probability"))
        processed += 1

print("\nTotal:", total)
print("Correct:", correct)
print("Accuracy:", correct / total)
print("Predicted:", predicted_count)
print("Not predicted:", not_predicted_count)
