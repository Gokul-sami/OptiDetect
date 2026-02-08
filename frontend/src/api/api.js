import axios from "axios";

const RAW_BASE = process.env.EXPO_PUBLIC_API_BASE_URL;
const BASE = (RAW_BASE || "").trim();

const isLocalhostBase = (baseUrl) => {
  try {
    const u = new URL(baseUrl);
    return u.hostname === "127.0.0.1" || u.hostname === "localhost";
  } catch {
    return false;
  }
};

const requireValidBase = () => {
  if (!BASE) {
    throw new Error(
      "Missing EXPO_PUBLIC_API_BASE_URL. Set it in frontend/.env (example: http://<your-laptop-wifi-ip>:8000) and restart Expo with --clear."
    );
  }
  if (isLocalhostBase(BASE)) {
    throw new Error(
      `Network Error: cannot reach ${BASE}. ` +
      "127.0.0.1/localhost will NOT work on a physical phone. Use your laptop Wi‑Fi IP (example: http://10.x.x.x:8000) and restart Expo."
    );
  }
};

const toHelpfulError = (error) => {
  const msg = error?.message || String(error);
  if (msg === "Network Error") {
    return new Error(
      `Network Error: cannot reach ${BASE}. ` +
      "If you're on a phone, the backend must be reachable from the phone over Wi‑Fi, and the backend must be started with host 0.0.0.0."
    );
  }
  return error instanceof Error ? error : new Error(msg);
};

export const predictLeukocoria = async (imageUri) => {
  requireValidBase();
  const form = new FormData();

  form.append("file", {
    uri: imageUri,
    name: "image.jpg",
    type: "image/jpeg",
  });

  try {
    const res = await axios.post(`${BASE}/predict/leukocoria`, form, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000,
    });
    return res.data;
  } catch (e) {
    throw toHelpfulError(e);
  }
};

export const predictSquint = async (imageUri) => {
  requireValidBase();
  const form = new FormData();

  form.append("file", {
    uri: imageUri,
    name: "image.jpg",
    type: "image/jpeg",
  });

  try {
    const res = await axios.post(`${BASE}/predict/squint`, form, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000,
    });
    return res.data;
  } catch (e) {
    throw toHelpfulError(e);
  }
};
