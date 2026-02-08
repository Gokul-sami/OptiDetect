import axios from "axios";

const BASE = "http://192.168.1.5:8000"; // CHANGE TO YOUR PC IP

export const predictLeukocoria = async (imageUri) => {
  const form = new FormData();

  form.append("file", {
    uri: imageUri,
    name: "image.jpg",
    type: "image/jpeg",
  });

  const res = await axios.post(`${BASE}/predict/leukocoria`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

export const predictSquint = async (imageUri) => {
  const form = new FormData();

  form.append("file", {
    uri: imageUri,
    name: "image.jpg",
    type: "image/jpeg",
  });

  const res = await axios.post(`${BASE}/predict/squint`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};
