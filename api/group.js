import { API_URL } from "./config";

const API_ROOT = API_URL.replace(/\/$/, "");
const BASE_URL = `${API_ROOT}/api/GroupApi`;

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

// =====================
// SAFE FETCH
// =====================

const safeFetch = async (url, options = {}) => {
  try {
    console.log("CALL API GROUP SV:", url);

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
      console.log("SERVER RAW RESPONSE GROUP SV:", text);
      throw new Error("Server không trả JSON. Kiểm tra lại URL API.");
    }

    console.log("API GROUP SV RESPONSE:", data);

    if (!res.ok) {
      throw new Error(getApiMessage(data, `HTTP ${res.status}`));
    }

    if (data && data.success === false) {
      throw new Error(getApiMessage(data));
    }

    return data;
  } catch (err) {
    console.log("GROUP SV API ERROR:", err.message);
    throw err;
  }
};

// =====================
// HELPER DISPLAY
// =====================

export const getGroupId = (item) => {
  return item?.MaNhom ?? item?.maNhom ?? item?.id ?? item?.Id;
};

export const getGroupName = (item) => {
  return item?.TenNhom ?? item?.tenNhom ?? "";
};

export const getGroupSubjectName = (item) => {
  return item?.TenMonHoc ?? item?.tenMonHoc ?? "";
};

export const getGroupDisplayName = (item) => {
  if (!item) return "Chưa có nhóm";

  return (
    item.TenLopMon ||
    item.tenLopMon ||
    item.TenHienThi ||
    item.tenHienThi ||
    `${getGroupName(item) || "Chưa có nhóm"} - ${
      getGroupSubjectName(item) || "Chưa có môn"
    }`
  );
};

export const getTeacherName = (item) => {
  return (
    item?.TenGiangVien ||
    item?.tenGiangVien ||
    item?.GiangVienInfo?.HoTen ||
    item?.giangVienInfo?.hoTen ||
    ""
  );
};

export const getInviteCode = (item) => {
  return item?.MaMoi ?? item?.maMoi ?? "";
};

export const getGroupSize = (item) => {
  return item?.SiSo ?? item?.siSo ?? 0;
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
  return item?.HoTen || item?.hoTen || "";
};

export const getStudentEmail = (item) => {
  return item?.Email || item?.email || "";
};

// =====================
// 1. MY GROUPS
// GET /api/GroupApi/MyGroups?userId=...&search=...
// =====================

export const getMyGroups = async (userId, search = "") => {
  if (isEmpty(userId)) {
    throw new Error("Chưa đăng nhập");
  }

  let url = `${BASE_URL}/MyGroups?userId=${encodeURIComponent(userId)}`;

  if (!isEmpty(search)) {
    url += `&search=${encodeURIComponent(String(search).trim())}`;
  }

  return safeFetch(url, {
    method: "GET",
  });
};

// Alias nếu screen cũ gọi tên khác
export const getGroupsSV = getMyGroups;
export const getGroupSV = getMyGroups;

// =====================
// 2. INDEX ALIAS
// GET /api/GroupApi/Index?userId=...&search=...
// =====================

export const getGroupIndex = async (userId, search = "") => {
  if (isEmpty(userId)) {
    throw new Error("Chưa đăng nhập");
  }

  let url = `${BASE_URL}/Index?userId=${encodeURIComponent(userId)}`;

  if (!isEmpty(search)) {
    url += `&search=${encodeURIComponent(String(search).trim())}`;
  }

  return safeFetch(url, {
    method: "GET",
  });
};

// =====================
// 3. FIND BY INVITE CODE
// GET /api/GroupApi/FindByCode?userId=...&maMoi=...
// Dùng để preview nhóm trước khi tham gia.
// =====================

export const findGroupByCode = async (userId, maMoi) => {
  if (isEmpty(userId)) {
    throw new Error("Chưa đăng nhập");
  }

  if (isEmpty(maMoi)) {
    throw new Error("Vui lòng nhập mã nhóm");
  }

  const url =
    `${BASE_URL}/FindByCode?userId=${encodeURIComponent(userId)}` +
    `&maMoi=${encodeURIComponent(String(maMoi).trim())}`;

  return safeFetch(url, {
    method: "GET",
  });
};

// =====================
// 4. JOIN GROUP
// POST /api/GroupApi/Join
// Body: { UserId, MaMoi }
// =====================

export const joinGroup = async (userId, maMoi) => {
  if (isEmpty(userId)) {
    throw new Error("Chưa đăng nhập");
  }

  if (isEmpty(maMoi)) {
    throw new Error("Vui lòng nhập mã nhóm");
  }

  return safeFetch(`${BASE_URL}/Join`, {
    method: "POST",
    body: JSON.stringify({
      UserId: userId,
      MaMoi: String(maMoi).trim(),
    }),
  });
};

// Alias nếu screen đang gọi joinNhom
export const joinNhom = joinGroup;

// =====================
// 5. LEAVE GROUP
// POST /api/GroupApi/Leave
// Body: { UserId, MaNhom }
// =====================

export const leaveGroup = async (userId, maNhom) => {
  if (isEmpty(userId)) {
    throw new Error("Chưa đăng nhập");
  }

  if (!maNhom) {
    throw new Error("Thiếu mã nhóm");
  }

  return safeFetch(`${BASE_URL}/Leave`, {
    method: "POST",
    body: JSON.stringify({
      UserId: userId,
      MaNhom: toInt(maNhom),
    }),
  });
};

// Alias nếu screen đang gọi leaveNhom
export const leaveNhom = leaveGroup;

// =====================
// 6. DETAIL GROUP
// GET /api/GroupApi/Detail?userId=...&maNhom=...
// =====================

export const getGroupDetail = async (userId, maNhom) => {
  if (isEmpty(userId)) {
    throw new Error("Chưa đăng nhập");
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

  // Chuẩn hóa cho screen dễ dùng
  if (res?.success) {
    return {
      ...res,
      group: res.data || res.Data,
      data: res.data || res.Data,
      students: res.sinhVien || res.SinhVien || [],
      sinhVien: res.sinhVien || res.SinhVien || [],
      SinhVien: res.sinhVien || res.SinhVien || [],
    };
  }

  return res;
};

export const getNhomSVDetail = getGroupDetail;
export const refreshGroupDetail = getGroupDetail;

export default {
  getMyGroups,
  getGroupsSV,
  getGroupSV,
  getGroupIndex,
  findGroupByCode,
  joinGroup,
  joinNhom,
  leaveGroup,
  leaveNhom,
  getGroupDetail,
  getNhomSVDetail,
  refreshGroupDetail,

  getGroupId,
  getGroupName,
  getGroupSubjectName,
  getGroupDisplayName,
  getTeacherName,
  getInviteCode,
  getGroupSize,
  getStudentId,
  getStudentName,
  getStudentEmail,
};

