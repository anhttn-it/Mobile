import { API_URL } from "./config";

const BASE = `${API_URL}/api/lichsu`;

const safeFetch = async (url) => {
  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) throw new Error(data?.Message || "Error");
  return data;
};

// ===== LIST LỊCH SỬ =====
export const getLichSu = (userId) =>
  safeFetch(`${BASE}/list?userId=${userId}`);

// ===== DETAIL =====
export const getLichSuDetail = (maKetQua) =>
  safeFetch(`${BASE}/detail/${maKetQua}`);