import { API_URL } from "./config";

const BASE = `${API_URL}/api/lambai`;

const safeFetch = async (url, options) => {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.Message || "Error");
  return data;
};

// danh sách đề
export const getDeThi = (userId) =>
  safeFetch(`${BASE}/dethi?userId=${userId}`);

// chi tiết đề
export const getDeThiDetail = (id) =>
  safeFetch(`${BASE}/lam/${id}`);

// nộp bài
export const nopBai = (payload) =>
  safeFetch(`${BASE}/nopbai`, {
    method: "POST",
    body: JSON.stringify(payload),
  });