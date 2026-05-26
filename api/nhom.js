import { API_URL } from "./config";

const API_ROOT = API_URL.replace(/\/$/, "");
const BASE_URL = `${API_ROOT}/api/NhomApi`;

// =====================
// HELPER
// =====================

const isEmpty = (value) => {
  return !value || !String(value).trim();
};

const getApiMessage = (data, fallback = "Request thất bại") => {
  return (
    data?.message ||
    data?.Message ||
    data?.error ||
    data?.Error ||
    fallback
  );
};

const toInt = (value) => {
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? null : n;
};

const getUserIdFromPayload = (payload = {}) => {
  return (
    payload.userId ||
    payload.UserId ||
    payload.GiangVien ||
    payload.giangVien ||
    ""
  );
};

// =====================
// SAFE FETCH
// =====================

const safeFetch = async (url, options = {}) => {
  try {
    console.log("CALL API NHOM:", url);

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

    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      console.log("SERVER RAW RESPONSE NHOM:", text);
      throw new Error("Server không trả JSON. Kiểm tra lại URL API.");
    }

    console.log("API NHOM RESPONSE:", data);

    if (!res.ok) {
      throw new Error(getApiMessage(data, `HTTP ${res.status}`));
    }

    if (data && data.success === false) {
      throw new Error(getApiMessage(data));
    }

    return data;
  } catch (err) {
    console.log("NHOM API ERROR:", err.message);
    throw err;
  }
};

// =====================
// HELPER DISPLAY
// =====================

export const getNhomId = (item) => {
  return item?.MaNhom ?? item?.maNhom ?? item?.id ?? item?.Id;
};

export const getNhomName = (item) => {
  return item?.TenNhom ?? item?.tenNhom ?? "";
};

export const getNhomSubjectName = (item) => {
  return item?.TenMonHoc ?? item?.tenMonHoc ?? "";
};

export const getNhomDisplayName = (item) => {
  if (!item) return "Chưa có nhóm-môn";

  return (
    item.TenLopMon ||
    item.tenLopMon ||
    item.TenHienThi ||
    item.tenHienThi ||
    `${getNhomName(item) || "Chưa có nhóm"} - ${
      getNhomSubjectName(item) || "Chưa có môn"
    }`
  );
};

export const getNhomInviteCode = (item) => {
  return item?.MaMoi ?? item?.maMoi ?? "";
};

export const getNhomSize = (item) => {
  return item?.SiSo ?? item?.siSo ?? 0;
};

export const getNhomStatus = (item) => {
  return item?.TrangThai ?? item?.trangThai ?? true;
};

export const getStudentId = (item) => {
  return (
    item?.MaNguoiDung ||
    item?.maNguoiDung ||
    item?.Id ||
    item?.id ||
    item?.UserId ||
    item?.userId
  );
};

export const getStudentName = (item) => {
  return (
    item?.HoTen ||
    item?.hoTen ||
    item?.TenSinhVien ||
    item?.tenSinhVien ||
    ""
  );
};

export const getStudentEmail = (item) => {
  return item?.Email || item?.email || "";
};

// =====================
// 1. GET NHÓM THEO GIẢNG VIÊN
// GET /api/NhomApi/Index?userId=...&search=...
// =====================

export const getNhom = async (userId, search = "") => {
  if (isEmpty(userId)) {
    throw new Error("Thiếu userId");
  }

  let url = `${BASE_URL}/Index?userId=${encodeURIComponent(userId)}`;

  if (!isEmpty(search)) {
    url += `&search=${encodeURIComponent(String(search).trim())}`;
  }

  return safeFetch(url, {
    method: "GET",
  });
};

export const getNhomGV = getNhom;

// =====================
// 2. GET MÔN HỌC CỦA GIẢNG VIÊN
// GET /api/NhomApi/MonHoc?userId=...
// =====================

export const getMonHocGV = async (userId) => {
  if (isEmpty(userId)) {
    throw new Error("Thiếu userId");
  }

  return safeFetch(`${BASE_URL}/MonHoc?userId=${encodeURIComponent(userId)}`, {
    method: "GET",
  });
};

export const getMonHocByGV = getMonHocGV;

// =====================
// 3. CREATE NHÓM
// POST /api/NhomApi/Create
// Body: { UserId, TenNhom, MaMonHoc }
// =====================

export const createNhom = async (payload = {}) => {
  const userId = getUserIdFromPayload(payload);
  const tenNhom = payload.tenNhom ?? payload.TenNhom;
  const maMonHoc = payload.maMonHoc ?? payload.MaMonHoc;

  if (isEmpty(userId)) {
    throw new Error("Thiếu userId giảng viên");
  }

  if (isEmpty(tenNhom)) {
    throw new Error("Tên lớp không được để trống");
  }

  if (!maMonHoc) {
    throw new Error("Vui lòng chọn môn học");
  }

  const body = {
    UserId: userId,
    TenNhom: String(tenNhom).trim(),
    MaMonHoc: toInt(maMonHoc),
  };

  return safeFetch(`${BASE_URL}/Create`, {
    method: "POST",
    body: JSON.stringify(body),
  });
};

// =====================
// 4. DETAIL NHÓM
// GET /api/NhomApi/Detail?userId=...&maNhom=...
// =====================

export const getNhomDetail = async (userId, maNhom) => {
  if (isEmpty(userId)) {
    throw new Error("Thiếu userId giảng viên");
  }

  if (!maNhom) {
    throw new Error("Thiếu mã nhóm");
  }

  const url =
    `${BASE_URL}/Detail?userId=${encodeURIComponent(userId)}` +
    `&maNhom=${encodeURIComponent(maNhom)}`;

  const res = await safeFetch(url, {
    method: "GET",
  });

  return {
    ...res,
    MaNhom: res?.data?.MaNhom,
    TenNhom: res?.data?.TenNhom,
    MaMonHoc: res?.data?.MaMonHoc,
    TenMonHoc: res?.data?.TenMonHoc,
    TenLopMon: res?.data?.TenLopMon,
    MaMoi: res?.data?.MaMoi,
    SiSo: res?.data?.SiSo,
    TrangThai: res?.data?.TrangThai,
    HienThi: res?.data?.HienThi,
    students: res?.sinhVien || res?.SinhVien || [],
    SinhVien: res?.sinhVien || res?.SinhVien || [],
  };
};

// =====================
// 5. EDIT NHÓM
// POST /api/NhomApi/Edit
// Body: { UserId, MaNhom, TenNhom, MaMonHoc, TrangThai, HienThi }
// =====================

export const updateNhom = async (payload = {}) => {
  const userId = getUserIdFromPayload(payload);
  const maNhom = payload.maNhom ?? payload.MaNhom;
  const tenNhom = payload.tenNhom ?? payload.TenNhom;
  const maMonHoc = payload.maMonHoc ?? payload.MaMonHoc;

  if (isEmpty(userId)) {
    throw new Error("Thiếu userId giảng viên");
  }

  if (!maNhom) {
    throw new Error("Thiếu mã nhóm");
  }

  if (isEmpty(tenNhom)) {
    throw new Error("Tên lớp không được để trống");
  }

  if (!maMonHoc) {
    throw new Error("Vui lòng chọn môn học");
  }

  const body = {
    UserId: userId,
    MaNhom: toInt(maNhom),
    TenNhom: String(tenNhom).trim(),
    MaMonHoc: toInt(maMonHoc),
  };

  if (payload.trangThai !== undefined || payload.TrangThai !== undefined) {
    body.TrangThai = payload.trangThai ?? payload.TrangThai;
  }

  if (payload.hienThi !== undefined || payload.HienThi !== undefined) {
    body.HienThi = toInt(payload.hienThi ?? payload.HienThi);
  }

  return safeFetch(`${BASE_URL}/Edit`, {
    method: "POST",
    body: JSON.stringify(body),
  });
};

export const editNhom = updateNhom;

// =====================
// 6. XÓA NHÓM
// POST /api/NhomApi/Delete
// Body: { UserId, MaNhom }
// =====================

export const deleteNhom = async (userId, maNhom) => {
  if (isEmpty(userId)) {
    throw new Error("Thiếu userId giảng viên");
  }

  if (!maNhom) {
    throw new Error("Thiếu mã nhóm");
  }

  return safeFetch(`${BASE_URL}/Delete`, {
    method: "POST",
    body: JSON.stringify({
      UserId: userId,
      MaNhom: toInt(maNhom),
    }),
  });
};

// =====================
// 7. ADD STUDENT BY EMAIL
// POST /api/NhomApi/AddStudent
// Body: { UserId, MaNhom, Email }
// =====================

export const addStudent = async (userId, maNhom, email) => {
  if (isEmpty(userId)) {
    throw new Error("Thiếu userId giảng viên");
  }

  if (!maNhom || isEmpty(email)) {
    throw new Error("Thiếu mã nhóm hoặc email");
  }

  return safeFetch(`${BASE_URL}/AddStudent`, {
    method: "POST",
    body: JSON.stringify({
      UserId: userId,
      MaNhom: toInt(maNhom),
      Email: String(email).trim(),
    }),
  });
};

// =====================
// 8. REMOVE STUDENT
// POST /api/NhomApi/RemoveStudent
// Body: { UserId, MaNhom, MaNguoiDung }
// =====================

export const removeStudent = async (userId, maNhom, maNguoiDung) => {
  if (isEmpty(userId)) {
    throw new Error("Thiếu userId giảng viên");
  }

  if (!maNhom || isEmpty(maNguoiDung)) {
    throw new Error("Thiếu mã nhóm hoặc mã sinh viên");
  }

  return safeFetch(`${BASE_URL}/RemoveStudent`, {
    method: "POST",
    body: JSON.stringify({
      UserId: userId,
      MaNhom: toInt(maNhom),
      MaNguoiDung: maNguoiDung,
    }),
  });
};

// =====================
// 9. SYNC SĨ SỐ
// POST /api/NhomApi/SyncSiSo?userId=...&maNhom=...
// =====================

export const syncSiSoNhom = async (userId, maNhom) => {
  if (isEmpty(userId)) {
    throw new Error("Thiếu userId giảng viên");
  }

  if (!maNhom) {
    throw new Error("Thiếu mã nhóm");
  }

  const url =
    `${BASE_URL}/SyncSiSo?userId=${encodeURIComponent(userId)}` +
    `&maNhom=${encodeURIComponent(maNhom)}`;

  return safeFetch(url, {
    method: "POST",
  });
};

export const refreshNhomDetail = async (userId, maNhom) => {
  return getNhomDetail(userId, maNhom);
};

export default {
  getNhom,
  getNhomGV,
  getMonHocGV,
  getMonHocByGV,
  createNhom,
  getNhomDetail,
  updateNhom,
  editNhom,
  deleteNhom,
  addStudent,
  removeStudent,
  syncSiSoNhom,
  refreshNhomDetail,

  getNhomId,
  getNhomName,
  getNhomSubjectName,
  getNhomDisplayName,
  getNhomInviteCode,
  getNhomSize,
  getNhomStatus,
  getStudentId,
  getStudentName,
  getStudentEmail,
};

