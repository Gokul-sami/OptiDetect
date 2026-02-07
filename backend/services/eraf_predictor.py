import cv2
import numpy as np
import tensorflow as tf
import os
from tensorflow.keras.applications.efficientnet import preprocess_input

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "eraf.keras")

model = tf.keras.models.load_model(MODEL_PATH)

def preprocess_image_from_bytes(file_bytes):
    nparr = np.frombuffer(file_bytes, np.uint8)

    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    img = cv2.resize(img, (224, 224))

    img = img.astype(np.float32)

    img = preprocess_input(img)

    return np.expand_dims(img, axis=0)

def predict_from_array(file_bytes):
    x = preprocess_image_from_bytes(file_bytes)

    prob = float(model.predict(x)[0][0])

    label = "LEUKOCORIA" if prob >= 0.5 else "HEALTHY"

    return {
        "prediction": label,
        "probability": prob
    }
