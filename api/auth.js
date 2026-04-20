import { API_URL } from "./config";

export const loginApi = async (email, matKhau) => {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      Email: email,
      MatKhau: matKhau,
    }),
  });

  return res.json();
};
