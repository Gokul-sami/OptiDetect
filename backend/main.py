from fastapi import FastAPI, UploadFile, File
from services.eraf_predictor import predict_from_array

app = FastAPI()

@app.post("/predict/leukocoria")
async def predict(file: UploadFile = File(...)):
    file_bytes = await file.read()
    return predict_from_array(file_bytes)
