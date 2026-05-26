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
      throw new Error(data?.Message || data || "API error");
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
/*
Backend yêu cầu:
- mh.GiangVien bắt buộc
- validate + check trùng nằm server
*/
export const createMonHoc = async (data) => {
  return safeFetch(BASE_URL, {
    method: "POST",
    body: JSON.stringify({
      TenMonHoc: data.TenMonHoc,
      TrangThai: data.TrangThai ?? true,
      GiangVien: data.GiangVien,
    }),
  });
};

/* ================= UPDATE ================= */
export const updateMonHoc = async (id, data) => {
  return safeFetch(`${BASE_URL}/update/${id}`, {
    method: "POST",
    body: JSON.stringify({
      MaMonHoc: id,
      TenMonHoc: data.TenMonHoc,
      TrangThai: data.TrangThai,
      GiangVien: data.GiangVien, // cần để check quyền
    }),
  });
};

/* ================= DELETE ================= */
export const deleteMonHoc = async (id, giangVien) => {
  return safeFetch(`${BASE_URL}/delete/${id}?giangVien=${giangVien}`, {
    method: "POST",
  });
};

/* ================= DETAIL ================= */
export const getMonHocDetail = async (id, giangVien) => {
  return safeFetch(`${BASE_URL}/${id}?giangVien=${giangVien}`, {
    method: "GET",
  });
};