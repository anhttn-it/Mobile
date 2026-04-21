import { API_URL } from "./config";

const BASE_URL = `${API_URL}/api/dethi`;

// =====================
// HELPER FETCH
// =====================
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
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      console.log("❌ JSON ERROR:", text);
      throw new Error("Server trả về dữ liệu không hợp lệ");
    }

    if (!res.ok) {
      console.log("❌ API ERROR:", data);
      throw new Error(data?.Message || data || "Request thất bại");
    }

    return data;
  } catch (err) {
    console.log("❌ NETWORK ERROR:", err.message);
    throw new Error(err.message || "Không thể kết nối server");
  }
};

// =====================
// 1. DANH SÁCH ĐỀ THI
// =====================
export const getDeThiList = async (userId) => {
  return safeFetch(`${BASE_URL}/list?userId=${userId}`, {
    method: "GET",
  });
};

// =====================
// 2. CHI TIẾT ĐỀ THI
// =====================
export const getDeThiDetail = async (id, userId) => {
  return safeFetch(`${BASE_URL}/detail/${id}?userId=${userId}`, {
    method: "GET",
  });
};

// =====================
// 3. TẠO ĐỀ THI (KHỚP DTO BACKEND)
// =====================
export const createDeThi = async (payload) => {
  if (!payload.TenDe) throw new Error("Thiếu tên đề");
  if (!payload.MaMonHoc) throw new Error("Thiếu môn học");
  if (!payload.userId) throw new Error("Thiếu userId");

  if (payload.kieu === "manual" && (!payload.selectedCauHoi || payload.selectedCauHoi.length === 0)) {
    throw new Error("Chưa chọn câu hỏi");
  }

  return safeFetch(`${BASE_URL}/create`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};
// =====================
// 4. XÓA ĐỀ THI
// =====================
export const deleteDeThi = async (id, userId) => {
  return safeFetch(`${BASE_URL}/delete/${id}?userId=${userId}`, {
    method: "POST",
  });
};

// =====================
// 5. NỘP BÀI
// =====================
export const nopBai = async (payload) => {
  return safeFetch(`${BASE_URL}/nopbai`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

// =====================
// 6. LẤY MÔN HỌC
// =====================
export const getMonHocByUser = async (userId) => {
  return safeFetch(`${BASE_URL}/monhoc?userId=${userId}`, {
    method: "GET",
  });
};

// =====================
// 7. LẤY NHÓM THEO MÔN
// =====================
export const getNhomByMon = async (maMon, userId) => {
  return safeFetch(
    `${BASE_URL}/nhom?maMon=${maMon}&userId=${userId}`,
    { method: "GET" }
  );
};

// =====================
// 8. LẤY CÂU HỎI THEO MÔN (MANUAL)
// =====================
export const getCauHoiByMon = async (maMon, userId) => {
  return safeFetch(
    `${BASE_URL}/cauhoi?maMon=${maMon}&userId=${userId}`,
    { method: "GET" }
  );
};

export const updateDeThi = async (payload) => {
  return safeFetch(`${BASE_URL}/update`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};