import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from services.eraf_predictor import predict_from_array
from services.squint_predictor import predict_squint_from_array

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/health")
async def health():
    return {"ok": True}

@app.post("/predict/leukocoria")
async def predict(file: UploadFile = File(...)):
    print("Received file for leukocoria:", file.filename)
    file_bytes = await file.read()
    return predict_from_array(file_bytes)

@app.post("/predict/squint")
async def predict_squint(file: UploadFile = File(...)):
    print("Received file for squint:", file.filename)
    bytes_data = await file.read()
    npimg = np.frombuffer(bytes_data, np.uint8)
    img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
    result = predict_squint_from_array(img)
    return result
