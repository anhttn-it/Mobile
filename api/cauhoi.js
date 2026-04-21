import { API_URL } from "./config";

const BASE_URL = `${API_URL}/api/cauhoi`;

// =====================
// HELPER FETCH (GIỐNG NHÓM API)
// =====================
const safeFetch = async (url, options = {}) => {
  try {
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
// 1. GET CÂU HỎI
// =====================
export const getCauHoi = async (userId, maMonHoc = null, search = "") => {
  if (!userId) throw new Error("Thiếu userId");

  let url = `${BASE_URL}/list?userId=${userId}`;

  if (maMonHoc) url += `&maMonHoc=${maMonHoc}`;
  if (search) url += `&search=${search}`;

  return safeFetch(url, {
    method: "GET",
  });
};

// =====================
// 2. CREATE CÂU HỎI
// =====================
export const createCauHoi = async (payload) => {
  if (
    !payload.NoiDung ||
    !payload.DoKho ||
    !payload.MaMonHoc ||
    !payload.dapAn ||
    !payload.userId
  ) {
    throw new Error("Thiếu dữ liệu câu hỏi");
  }

  console.log("📤 CREATE CAUHOI:", payload);

  return safeFetch(`${BASE_URL}/create`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};
// =====================
// 3. UPDATE CÂU HỎI
// =====================
export const updateCauHoi = async ({
  MaCauHoi,
  NoiDung,
  DoKho,
  MaMonHoc,
  dapAn,
  dapAnDung,
  userId,
}) => {
  if (!MaCauHoi) throw new Error("Thiếu MaCauHoi");

  const payload = {
    MaCauHoi: Number(MaCauHoi),
    NoiDung: NoiDung?.trim(),
    DoKho: Number(DoKho),
    MaMonHoc: Number(MaMonHoc),
    dapAn,
    dapAnDung: Number(dapAnDung),
    userId,
  };

  console.log("📤 UPDATE:", payload);

  return safeFetch(`${BASE_URL}/update`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

// =====================
// 4. DELETE CÂU HỎI
// =====================
export const deleteCauHoi = async (id, userId) => {
  if (!id || !userId) throw new Error("Thiếu dữ liệu");

  return safeFetch(`${BASE_URL}/delete/${id}?userId=${userId}`, {
    method: "POST",
  });
};

// =====================
// 5. IMPORT FILE CSV
// =====================
export const importCauHoi = async (file, maMonHoc, userId) => {
  if (!file || !maMonHoc || !userId) {
    throw new Error("Thiếu dữ liệu import");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("maMonHoc", maMonHoc);
  formData.append("userId", userId);

  return fetch(`${BASE_URL}/import`, {
    method: "POST",
    body: formData,
    headers: {
      "ngrok-skip-browser-warning": "true",
    },
  }).then(async (res) => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  });
};

// =====================
// 6. GET DETAIL CÂU HỎI
// =====================
export const getCauHoiDetail = async (id, userId) => {
  if (!id || !userId) throw new Error("Thiếu dữ liệu");

  return safeFetch(`${BASE_URL}/detail/${id}?userId=${userId}`, {
    method: "GET",
  });
};



export const getMonHocByUser = async (userId) => {
  if (!userId) throw new Error("Thiếu userId");

  return safeFetch(
    `${BASE_URL}/monhoc?userId=${userId}`,
    { method: "GET" }
  );
};

