import { API_URL } from "./config";

const BASE_URL = `${API_URL}/api/monhoc`;

/* ================= SAFE FETCH ================= */
const safeFetch = async (url, options = {}) => {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
        ...(options.headers || {}),
      },
    });

    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error("Server không trả JSON");
    }

    if (!res.ok) {
      throw new Error(data?.Message || "API error");
    }

    return data;
  } catch (err) {
    console.log("API ERROR:", err.message);
    throw new Error("Không kết nối server");
  }
};

/* ================= GET ================= */
export const getMonHoc = async (giangVien, search = "") => {
  const res = await safeFetch(
    `${BASE_URL}?giangVien=${giangVien}&search=${search}`,
    { method: "GET" }
  );

  return res;
};

/* ================= CREATE ================= */
export const createMonHoc = async (data) => {
  return safeFetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

/* ================= UPDATE ================= */
export const updateMonHoc = async (id, data) => {
  return safeFetch(`${BASE_URL}/update/${id}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

/* ================= DELETE ================= */
export const deleteMonHoc = async (id) => {
  return safeFetch(`${BASE_URL}/delete/${id}`, {
    method: "POST",
  });
};

/* ================= DETAIL ================= */
export const getMonHocDetail = async (id) => {
  return safeFetch(`${BASE_URL}/${id}`, {
    method: "GET",
  });
};