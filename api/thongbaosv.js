import { API_URL } from "./config";

const API_ROOT = API_URL.replace(/\/$/, "");
const BASE_URL = `${API_ROOT}/SinhVien/ThongBaoSVApi`;

/* ================= SAFE FETCH ================= */
const safeFetch = async (url, options = {}) => {
  try {
    console.log("CALL API SV:", url);

    const res = await fetch(url, {
      ...options,
      headers: {
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
      console.log("SERVER RAW RESPONSE SV:", text);
      throw new Error("Server không trả JSON. Kiểm tra lại URL API.");
    }

    console.log("API SV RESPONSE:", data);

    if (!res.ok) {
      throw new Error(data?.message || data?.Message || "API error");
    }

    return data;
  } catch (err) {
    console.log("THONG BAO SV API ERROR:", err.message);
    throw err;
  }
};

/* ================= DANH SÁCH THÔNG BÁO ================= */
export const getThongBaoSV = async (userId, search = "") => {
  const url =
    `${BASE_URL}/Index?userId=${encodeURIComponent(userId || "")}` +
    `&search=${encodeURIComponent(search || "")}`;

  return safeFetch(url, {
    method: "GET",
  });
};

/* ================= CHI TIẾT THÔNG BÁO ================= */
/*
Khi gọi Detail, backend sẽ tự đánh dấu đã xem
*/
export const getThongBaoSVDetail = async (id, userId) => {
  const url =
    `${BASE_URL}/Detail/${id}?userId=${encodeURIComponent(userId || "")}`;

  return safeFetch(url, {
    method: "GET",
  });
};

/* ================= ĐÁNH DẤU ĐÃ XEM ================= */
export const markThongBaoSVRead = async (id, userId) => {
  const url =
    `${BASE_URL}/MarkRead/${id}?userId=${encodeURIComponent(userId || "")}`;

  return safeFetch(url, {
    method: "POST",
  });
};

/* ================= SỐ THÔNG BÁO CHƯA ĐỌC ================= */
export const getThongBaoSVUnreadCount = async (userId) => {
  const url =
    `${BASE_URL}/UnreadCount?userId=${encodeURIComponent(userId || "")}`;

  return safeFetch(url, {
    method: "GET",
  });
};

/* ================= LỚP - MÔN CỦA SINH VIÊN ================= */
export const getNhomSV = async (userId) => {
  const url =
    `${BASE_URL}/GetNhom?userId=${encodeURIComponent(userId || "")}`;

  return safeFetch(url, {
    method: "GET",
  });
};