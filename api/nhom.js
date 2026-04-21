import { API_URL } from "./config";

const BASE_URL = `${API_URL}/api/nhom`;

// =====================
// HELPER FETCH (CHỐNG NGROK + JSON ERROR)
// =====================
const safeFetch = async (url, options = {}) => {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true", // 🔥 FIX NGROK
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
// 1. GET NHÓM THEO USER
// =====================
export const getNhom = async (userId) => {
  if (!userId) throw new Error("Thiếu userId");

  return safeFetch(`${BASE_URL}?userId=${userId}`, {
    method: "GET",
  });
};

// =====================
// 2. CREATE NHÓM
// =====================
export const createNhom = async ({ TenNhom, MaMonHoc, GiangVien }) => {
  if (!TenNhom || !MaMonHoc || !GiangVien) {
    throw new Error("Thiếu dữ liệu tạo nhóm");
  }

  const payload = {
    TenNhom: TenNhom.trim(),
    MaMonHoc: parseInt(MaMonHoc),
    GiangVien,
  };

  console.log("📤 CREATE NHOM:", payload);

  return safeFetch(`${BASE_URL}/create`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

// =====================
// 3. JOIN NHÓM
// =====================
export const joinNhom = async (maMoi, maNguoiDung) => {
  if (!maMoi || !maNguoiDung) {
    throw new Error("Thiếu mã mời hoặc user");
  }

  return safeFetch(
    `${BASE_URL}/join?maMoi=${maMoi}&maNguoiDung=${maNguoiDung}`,
    {
      method: "POST",
    }
  );
};

// =====================
// 4. CHI TIẾT NHÓM (ĐÃ CHUẨN HÓA)
// =====================
export const getNhomDetail = async (id) => {
  if (!id) throw new Error("Thiếu id nhóm");

  const data = await safeFetch(`${BASE_URL}/${id}`, {
    method: "GET",
  });

  return {
    MaNhom: data.MaNhom,
    TenNhom: data.TenNhom,
    MaMoi: data.MaMoi,
    SiSo: data.SiSo,

    // 🔥 chuẩn hóa sinh viên
    students: data.SinhVien || [],
  };
};
// =====================
// 5. XÓA NHÓM
// =====================
export const deleteNhom = async (id) => {
  if (!id) throw new Error("Thiếu id");

  return safeFetch(`${BASE_URL}/${id}`, {
    method: "POST",
  });
};

// =====================
// 6. ADD STUDENT (EMAIL)
// =====================
export const addStudent = async (maNhom, email) => {
  if (!maNhom || !email) {
    throw new Error("Thiếu dữ liệu");
  }

  return safeFetch(
    `${BASE_URL}/add-student?maNhom=${maNhom}&email=${email}`,
    {
      method: "POST",
    }
  );
};

// =====================
// 7. REMOVE STUDENT
// =====================
export const removeStudent = async (maNhom, maNguoiDung) => {
  if (!maNhom || !maNguoiDung) {
    throw new Error("Thiếu dữ liệu");
  }

  return safeFetch(
    `${BASE_URL}/remove-student?maNhom=${maNhom}&maNguoiDung=${maNguoiDung}`,
    {
      method: "POST",
    }
  );
};


export const refreshNhomDetail = async (maNhom) => {
  return getNhomDetail(maNhom);
};


