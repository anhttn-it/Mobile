import { API_URL } from "./config";

// =====================
// HELPER SAFE FETCH
// =====================
const safeFetch = async (url, options) => {
  try {
    const res = await fetch(url, options);

    const text = await res.text(); // đọc raw trước (TRÁNH JSON lỗi)

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.log("❌ JSON ERROR:", text);
      throw new Error("Server trả về dữ liệu không hợp lệ");
    }

    if (!res.ok) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  } catch (err) {
    console.log("❌ NETWORK ERROR:", err.message);
    throw new Error("Không thể kết nối server");
  }
};

// =====================
// LOGIN
// =====================
export const loginApi = async (email, matKhau) => {
  return safeFetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Email: email,
      MatKhau: matKhau,
    }),
  });
};

// =====================
// REGISTER
// =====================
export const registerApi = async (data) => {
  return safeFetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

// =====================
// FORGOT
// =====================
export const forgotApi = async (email) => {
  return safeFetch(`${API_URL}/api/auth/forgot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Email: email }),
  });
};

// =====================
// RESET
// =====================
export const resetApi = async (data) => {
  return safeFetch(`${API_URL}/api/auth/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};