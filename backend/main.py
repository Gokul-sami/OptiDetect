from fastapi import FastAPI, UploadFile, File
import cv2
import numpy as np
from services.eraf_predictor import predict_from_array

app = FastAPI()

@app.post("/predict/leukocoria")
async def predict(file: UploadFile = File(...)):

    bytes_data = await file.read()

    npimg = np.frombuffer(bytes_data, np.uint8)
    img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    result = predict_from_array(img)

    return result
