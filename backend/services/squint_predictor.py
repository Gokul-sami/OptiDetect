import cv2
import math
import numpy as np
import mediapipe as mp

# =========================
# Load mediapipe landmarker
# =========================

from mediapipe.tasks import python
from mediapipe.tasks.python import vision

base_options = python.BaseOptions(
    model_asset_path="models/face_landmarker.task"
)

options = vision.FaceLandmarkerOptions(
    base_options=base_options,
    num_faces=1
)

detector = vision.FaceLandmarker.create_from_options(options)


# =========================
# Math helpers
# =========================

def dist(p1, p2):
    return math.sqrt((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2)


def centroid(points):
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    return (int(sum(xs)/len(xs)), int(sum(ys)/len(ys)))


# =========================
# Main prediction
# =========================

def predict_squint_from_array(img):

    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)

    result = detector.detect(mp_image)

    if not result.face_landmarks:
        return {"error": "No face detected"}

    lm = result.face_landmarks[0]
    h, w, _ = img.shape

    def p(i):
        return (int(lm[i].x*w), int(lm[i].y*h))

    left_iris = p(468)
    right_iris = p(473)
    nose = p(1)

    # ---- Condition 1 (distance symmetry)
    dl = dist(left_iris, nose)
    dr = dist(right_iris, nose)

    cond1 = abs(dl-dr) > 20


    # ---- Condition 2 (angle)
    slope1 = (right_iris[1]-left_iris[1])/(right_iris[0]-left_iris[0]+1e-6)
    midpoint = ((left_iris[0]+right_iris[0])//2,
                (left_iris[1]+right_iris[1])//2)

    slope2 = (midpoint[1]-nose[1])/(midpoint[0]-nose[0]+1e-6)

    angle = abs(math.degrees(math.atan((slope1-slope2)/(1+slope1*slope2+1e-6))))

    cond2 = abs(angle-90) > 5


    # ---- Condition 3 (iris-centroid symmetry)
    LEFT_CONTOUR = [33,7,163,144,145,153,154,155,133]
    RIGHT_CONTOUR = [362,382,381,380,374,373,390,249,263]

    left_points = [p(i) for i in LEFT_CONTOUR]
    right_points = [p(i) for i in RIGHT_CONTOUR]

    c_left = centroid(left_points)
    c_right = centroid(right_points)

    cond3 = abs(dist(left_iris,c_left)-dist(right_iris,c_right)) > 1


    is_squint = cond1 or cond2 or cond3

    return {
        "prediction": "SQUINT" if is_squint else "NORMAL",
        "probability": 1.0 if is_squint else 0.0,
        "distance_diff": abs(dl-dr),
        "angle": angle
    }
