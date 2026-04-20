import { API_URL } from "./config";

const BASE_URL = `${API_URL}/api/nhom`;

// =====================
// GET LIST
// =====================
export const getNhom = async () => {
  const res = await fetch(BASE_URL, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.log("GET ERROR:", text);
    throw new Error("API lỗi getNhom");
  }

  return await res.json();
};

// =====================
// JOIN CLASS
// =====================
export const joinNhom = async (maMoi, maNguoiDung) => {
  const url = `${BASE_URL}/join?maMoi=${maMoi}&maNguoiDung=${maNguoiDung}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });

  const data = await res.json();

  if (!res.ok) {
    console.log("JOIN ERROR:", data);
    throw new Error("Join thất bại");
  }

  return data;
};

// =====================
// CREATE CLASS
// =====================
export const createNhom = async (data) => {
  const payload = {
    TenNhom: data.TenNhom?.trim(),
    MaMonHoc: parseInt(data.MaMonHoc),

    // FIX BẮT BUỘC THEO DB
    GiangVien: data.GiangVien || "1",

    SiSo: 0,
    TrangThai: true,
    HienThi: 1,
  };

  console.log("SEND CREATE:", payload);

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await res.json();

  if (!res.ok) {
    console.log("CREATE ERROR:", result);
    throw new Error("Create failed");
  }

  return result;
};