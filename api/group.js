import { API_URL } from "./config";

const BASE_URL = `${API_URL}/api/group`;

const safeFetch = async (url, options = {}) => {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data?.Message || "Error");
  return data;
};

// ================= MY GROUPS =================
export const getMyGroups = (userId) => {
  return safeFetch(`${BASE_URL}/mygroups?userId=${userId}`);
};

// ================= JOIN GROUP =================
export const joinGroup = (userId, maMoi) => {
  return safeFetch(`${BASE_URL}/join`, {
    method: "POST",
    body: JSON.stringify({ userId, maMoi }),
  });
};

// ================= LEAVE GROUP =================
export const leaveGroup = (userId, maNhom) => {
  return safeFetch(`${BASE_URL}/leave?maNhom=${maNhom}&userId=${userId}`, {
    method: "POST",
  });
};