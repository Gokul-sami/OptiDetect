import axios from "axios";

const BASE = process.env.EXPO_PUBLIC_API_BASE_URL;

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
