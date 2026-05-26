import { API_URL } from "./config";

const BASE = `${API_URL}/api/lambai`;

// ================= FETCH HELPER =================
const safeFetch = async (url, options = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await res.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Server trả về dữ liệu không hợp lệ");
  }

  if (!res.ok) {
    throw new Error(data?.Message || "Request failed");
  }

  return data;
};

// ================= 1. DANH SÁCH ĐỀ =================
export const getDeThi = (userId) =>
  safeFetch(`${BASE}/dethi?userId=${userId}`, {
    method: "GET",
  });

// ================= 2. START LÀM BÀI (QUAN TRỌNG MỚI) =================
export const startLamBai = (maDe, userId) =>
  safeFetch(`${BASE}/start`, {
    method: "POST",
    body: JSON.stringify({
      MaDe: maDe,
      UserId: userId,
    }),
  });

// ================= 3. CHI TIẾT ĐỀ =================
export const getDeThiDetail = (id, userId) =>
  safeFetch(`${BASE}/lam/${id}?userId=${userId}`, {
    method: "GET",
  });

// ================= 4. NỘP BÀI =================
export const nopBai = (payload) =>
  safeFetch(`${BASE}/nopbai`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

// ================= 5. UPDATE TAB =================
export const updateTab = (maKetQua, count) =>
  safeFetch(`${BASE}/tab`, {
    method: "POST",
    body: JSON.stringify({
      MaKetQua: maKetQua,
      Count: count,
    }),
  });