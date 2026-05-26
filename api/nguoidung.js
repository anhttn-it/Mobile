import { API_URL } from "./config";

const BASE_URL = `${API_URL}/api/NguoiDungApi`;


// =====================
// BUILD QUERY
// =====================
const buildQuery = (params = {}) => {
  const query = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");

  return query ? `?${query}` : "";
};


// =====================
// SAFE FETCH JSON
// =====================
const safeFetch = async (url, options = {}) => {
  try {
    const isFormData = options.body instanceof FormData;

    const headers = {
      Accept: "application/json",
      "ngrok-skip-browser-warning": "true",
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {})
    };

    const res = await fetch(url, {
      ...options,
      headers
    });

    const text = await res.text();

    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      throw new Error(text || "Response không hợp lệ");
    }

    if (!res.ok) {
      throw new Error(
        data?.message ||
        data?.Message ||
        data?.error ||
        "Request lỗi"
      );
    }

    return data;
  } catch (err) {
    throw err;
  }
};


// =====================
// SAFE FETCH FILE/BLOB
// Dùng cho Export CSV
// =====================
const safeFetchBlob = async (url, options = {}) => {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        Accept: "text/csv, application/json",
        "ngrok-skip-browser-warning": "true",
        ...(options.headers || {})
      }
    });

    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const data = await res.json();

      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || data?.Message || "Export lỗi");
      }

      return data;
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Export lỗi");
    }

    const blob = await res.blob();

    return {
      success: true,
      blob
    };
  } catch (err) {
    throw err;
  }
};


// ======================================================
// 1. GET NHÓM-MÔN CỦA GIẢNG VIÊN
// GET /api/NguoiDungApi/Nhom?userId=...
// ======================================================
export const getNhomNguoiDung = async (userId) => {
  const url = `${BASE_URL}/Nhom${buildQuery({ userId })}`;

  return safeFetch(url, {
    method: "GET"
  });
};


// ======================================================
// 2. GET USERS
// GET /api/NguoiDungApi/Index?userId=...&search=...&nhomId=...&page=...
// ======================================================
export const getNguoiDung = async (
  userId,
  search = "",
  nhomId = null,
  page = 1
) => {
  const url = `${BASE_URL}/Index${buildQuery({
    userId,
    search,
    nhomId,
    page
  })}`;

  return safeFetch(url, {
    method: "GET"
  });
};


// ======================================================
// 3. DETAIL
// GET /api/NguoiDungApi/Detail?userId=...&id=...
// ======================================================
export const getNguoiDungDetail = async (userId, id) => {
  const url = `${BASE_URL}/Detail${buildQuery({
    userId,
    id
  })}`;

  return safeFetch(url, {
    method: "GET"
  });
};


// ======================================================
// 4. GET DATA EDIT
// GET /api/NguoiDungApi/Edit?userId=...&id=...
// Dùng khi mở màn hình/modal sửa
// ======================================================
export const getNguoiDungEdit = async (userId, id) => {
  const url = `${BASE_URL}/Edit${buildQuery({
    userId,
    id
  })}`;

  return safeFetch(url, {
    method: "GET"
  });
};


// ======================================================
// 5. CREATE
// POST /api/NguoiDungApi/Create
//
// payload bắt buộc dạng:
// {
//   userId,
//   hoTen,
//   email,
//   gioiTinh,
//   ngaySinh,
//   trangThai,
//   maNhoms: [1, 2]
// }
// ======================================================
export const createNguoiDung = async (payload) => {
  return safeFetch(`${BASE_URL}/Create`, {
    method: "POST",
    body: JSON.stringify({
      userId: payload.userId,
      hoTen: payload.hoTen,
      email: payload.email,
      gioiTinh: payload.gioiTinh,
      ngaySinh: payload.ngaySinh,
      trangThai: payload.trangThai,
      maNhoms: payload.maNhoms || []
    })
  });
};


// ======================================================
// 6. EDIT
// POST /api/NguoiDungApi/Edit
//
// payload bắt buộc dạng:
// {
//   userId,
//   id,
//   hoTen,
//   gioiTinh,
//   ngaySinh,
//   trangThai,
//   maNhoms: [1, 2]
// }
//
// Không gửi email vì API không cho sửa email
// ======================================================
export const editNguoiDung = async (payload) => {
  return safeFetch(`${BASE_URL}/Edit`, {
    method: "POST",
    body: JSON.stringify({
      userId: payload.userId,
      id: payload.id,
      hoTen: payload.hoTen,
      gioiTinh: payload.gioiTinh,
      ngaySinh: payload.ngaySinh,
      trangThai: payload.trangThai,
      maNhoms: payload.maNhoms || []
    })
  });
};


// ======================================================
// 7. DELETE
// POST /api/NguoiDungApi/DeleteConfirmed
//
// Xóa khỏi 1 nhóm:
// deleteNguoiDung(userId, id, 1)
//
// Xóa khỏi nhiều nhóm:
// deleteNguoiDung(userId, id, [1, 2])
// ======================================================
export const deleteNguoiDung = async (userId, id, maNhomOrMaNhoms) => {
  let body = {
    userId,
    id
  };

  if (Array.isArray(maNhomOrMaNhoms)) {
    body.maNhoms = maNhomOrMaNhoms;
  } else {
    body.maNhom = maNhomOrMaNhoms;
  }

  return safeFetch(`${BASE_URL}/DeleteConfirmed`, {
    method: "POST",
    body: JSON.stringify(body)
  });
};


// ======================================================
// 8. IMPORT CSV
// POST /api/NguoiDungApi/Import?userId=...
//
// file trong React Native nên dạng:
// {
//   uri: "...",
//   name: "students.csv",
//   type: "text/csv"
// }
// ======================================================
export const importNguoiDung = async (userId, file) => {
  const formData = new FormData();

  formData.append("file", file);

  const url = `${BASE_URL}/Import${buildQuery({ userId })}`;

  return safeFetch(url, {
    method: "POST",
    body: formData
  });
};


// ======================================================
// 9. EXPORT CSV
// GET /api/NguoiDungApi/Export?userId=...&nhomId=...
// Trả về blob để mobile tự xử lý lưu file
// ======================================================
export const exportNguoiDung = async (userId, nhomId = null) => {
  const url = `${BASE_URL}/Export${buildQuery({
    userId,
    nhomId
  })}`;

  return safeFetchBlob(url, {
    method: "GET"
  });
};