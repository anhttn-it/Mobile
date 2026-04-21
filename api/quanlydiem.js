import { API_URL } from "./config";

const BASE_URL = `${API_URL}/api/quanlydiem`;

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
      data = JSON.parse(text);
    } catch (e) {
      console.log("❌ JSON ERROR:", text);
      throw new Error("Server trả về dữ liệu không hợp lệ");
    }

    if (!res.ok) {
      console.log("❌ API ERROR:", data);
      throw new Error(data?.Message || "Request thất bại");
    }

    return data;
  } catch (err) {
    console.log("❌ NETWORK ERROR:", err.message);
    throw new Error("Không thể kết nối server");
  }
};


// =====================
// 1. LẤY NHÓM GIẢNG VIÊN
// =====================
export const getNhomGV = async (giangVien, maMonHoc = null) => {
  if (!giangVien) throw new Error("Thiếu giảng viên");

  let url = `${BASE_URL}/nhom?giangVien=${giangVien}`;
  if (maMonHoc) url += `&maMonHoc=${maMonHoc}`;

  return safeFetch(url, { method: "GET" });
};


// =====================
// 2. DANH SÁCH ĐỀ
// =====================
export const getDeThi = async (maNhom) => {
  if (!maNhom) throw new Error("Thiếu mã nhóm");

  return safeFetch(`${BASE_URL}/dethi?maNhom=${maNhom}`, {
    method: "GET",
  });
};


// =====================
// 3. CHI TIẾT ĐỀ
// =====================
export const getChiTietDe = async (maDe, maNhom) => {
  return safeFetch(
    `${BASE_URL}/chitietde?maDe=${maDe}&maNhom=${maNhom}`,
    { method: "GET" }
  );
};


// =====================
// 4. ĐÃ NỘP
// =====================
export const getDaNop = async (maDe) => {
  return safeFetch(`${BASE_URL}/danop?maDe=${maDe}`, {
    method: "GET",
  });
};


// =====================
// 5. CHƯA NỘP
// =====================
export const getChuaNop = async (maDe, maNhom) => {
  return safeFetch(
    `${BASE_URL}/chuanop?maDe=${maDe}&maNhom=${maNhom}`,
    { method: "GET" }
  );
};


// =====================
// 6. THỐNG KÊ ĐIỂM
// =====================
export const getThongKeDiem = async (maDe) => {
  return safeFetch(`${BASE_URL}/thongkediem?maDe=${maDe}`, {
    method: "GET",
  });
};


// =====================
// 7. THỐNG KÊ CÂU HỎI
// =====================
export const getThongKeCauHoi = async (maDe) => {
  return safeFetch(`${BASE_URL}/thongkecauhoi?maDe=${maDe}`, {
    method: "GET",
  });
};


// =====================
// 8. EXPORT CSV (trả data JSON)
// =====================
export const exportCSV = async (maDe) => {
  return safeFetch(`${BASE_URL}/export?maDe=${maDe}`, {
    method: "GET",
  });
};


// =====================
// 9. CHI TIẾT BÀI LÀM
// =====================
export const getChiTietBaiLam = async (maKetQua) => {
  return safeFetch(`${BASE_URL}/chitietbailam?maKetQua=${maKetQua}`, {
    method: "GET",
  });
};