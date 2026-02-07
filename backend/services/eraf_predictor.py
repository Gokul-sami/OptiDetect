import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.applications.efficientnet import preprocess_input

# Load model
MODEL_PATH = "models/eraf.keras"

model = tf.keras.models.load_model(
    MODEL_PATH,
    compile=False,
    safe_mode=False
)

IMG_SIZE = 224

# Haar detector
eye_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_eye.xml"
)


def refine_eye_crop(img, box, scale=0.75):
    x1, y1, x2, y2 = box
    w = x2 - x1
    h = y2 - y1

    cx = x1 + w // 2
    cy = y1 + h // 2

    new_w = int(w * scale)
    new_h = int(h * scale)

    nx1 = max(cx - new_w // 2, 0)
    ny1 = max(cy - new_h // 2, 0)
    nx2 = min(cx + new_w // 2, img.shape[1])
    ny2 = min(cy + new_h // 2, img.shape[0])

    return img[ny1:ny2, nx1:nx2]


def detect_both_eyes_haar(img):
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)

    eyes = eye_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(30, 30)
    )

    if len(eyes) < 2:
        return None

    eyes = sorted(eyes, key=lambda e: e[2]*e[3], reverse=True)[:2]
    eyes = sorted(eyes, key=lambda e: e[0])

    crops = []

    for (x, y, w, h) in eyes:
        pad = int(0.3 * max(w, h))
        x1 = max(x - pad, 0)
        y1 = max(y - pad, 0)
        x2 = min(x + w + pad, img.shape[1])
        y2 = min(y + h + pad, img.shape[0])

        crop = refine_eye_crop(img, (x1, y1, x2, y2))
        crops.append(crop)

    return crops


def preprocess_eye(eye):
    eye = cv2.resize(eye, (IMG_SIZE, IMG_SIZE))
    eye = eye.astype(np.float32)
    eye = preprocess_input(eye)
    return eye


# PREDICTION FUNCTION
def predict_from_array(file_bytes):

    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        return {"error": "Invalid image"}

    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    eyes = detect_both_eyes_haar(img)

    if eyes is None:
        return {"error": "Eyes not detected"}

    probs = []

    for eye in eyes:
        eye = preprocess_eye(eye)
        eye = np.expand_dims(eye, axis=0)

        prob = float(model.predict(eye, verbose=0)[0][0])
        probs.append(prob)

    final_prob = max(probs)

    label = "LEUKOCORIA" if final_prob >= 0.6 else "HEALTHY"

    print("Left:", probs[0], "Right:", probs[1])

    return {
        "prediction": label,
        "probability": final_prob,
        "left_eye_prob": probs[0],
        "right_eye_prob": probs[1]
    }
