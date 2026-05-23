import { API_URL } from "./config";

const API_ROOT = API_URL.replace(/\/$/, "");
const BASE_URL = `${API_ROOT}/GiangVien/ThongBaoGVApi`;

/* ================= SAFE FETCH ================= */
const safeFetch = async (url, options = {}) => {
  try {
    console.log("CALL API:", url);

    const res = await fetch(url, {
      ...options,
      headers: {
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
      console.log("SERVER RAW RESPONSE:", text);
      throw new Error("Server không trả JSON. Kiểm tra lại URL API.");
    }

    console.log("API RESPONSE:", data);

    if (!res.ok) {
      throw new Error(data?.message || data?.Message || "API error");
    }

    return data;
  } catch (err) {
    console.log("THONG BAO API ERROR:", err.message);
    throw err;
  }
};

/* ================= DANH SÁCH ================= */
export const getThongBaoGV = async (userId, search = "") => {
  console.log("GET THONG BAO USER ID:", userId);

  const url =
    `${BASE_URL}/Index?userId=${encodeURIComponent(userId || "")}` +
    `&search=${encodeURIComponent(search || "")}`;

  return safeFetch(url, {
    method: "GET",
  });
};

/* ================= CHI TIẾT ================= */
export const getThongBaoGVDetail = async (id, userId) => {
  console.log("GET DETAIL USER ID:", userId);

  const url =
    `${BASE_URL}/Detail/${id}?userId=${encodeURIComponent(userId || "")}`;

  return safeFetch(url, {
    method: "GET",
  });
};

/* ================= NHÓM GIẢNG VIÊN ================= */
export const getNhomGV = async (userId) => {
  console.log("GET NHOM USER ID:", userId);

  const url =
    `${BASE_URL}/GetNhom?userId=${encodeURIComponent(userId || "")}`;

  return safeFetch(url, {
    method: "GET",
  });
};

/* ================= CREATE ================= */
export const createThongBaoGV = async ({
  userId,
  noiDung,
  maNhom = [],
  fileDinhKem,
}) => {
  try {
    console.log("CREATE USER ID:", userId);

    const formData = new FormData();

    formData.append("userId", userId || "");
    formData.append("noiDung", noiDung || "");

    if (Array.isArray(maNhom) && maNhom.length > 0) {
      formData.append("maNhom", maNhom.join(","));
    }

    if (fileDinhKem) {
      formData.append("fileDinhKem", {
        uri: fileDinhKem.uri,
        type: fileDinhKem.type || "application/octet-stream",
        name: fileDinhKem.name || "file_upload",
      });
    }

    const url = `${BASE_URL}/Create`;

    console.log("CALL API:", url);

    const res = await fetch(url, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    });

    const text = await res.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch (e) {
      console.log("CREATE RAW RESPONSE:", text);
      throw new Error("Server không trả JSON khi thêm thông báo.");
    }

    console.log("CREATE RESPONSE:", data);

    if (!res.ok) {
      throw new Error(data?.message || data?.Message || "Create API error");
    }

    return data;
  } catch (err) {
    console.log("CREATE THONG BAO ERROR:", err.message);
    throw err;
  }
};

/* ================= UPDATE ================= */
export const updateThongBaoGV = async (
  id,
  {
    userId,
    noiDung,
    maNhom = [],
    fileDinhKem,
  }
) => {
  try {
    console.log("UPDATE USER ID:", userId);

    const formData = new FormData();

    formData.append("userId", userId || "");
    formData.append("noiDung", noiDung || "");

    if (Array.isArray(maNhom) && maNhom.length > 0) {
      formData.append("maNhom", maNhom.join(","));
    }

    if (fileDinhKem) {
      formData.append("fileDinhKem", {
        uri: fileDinhKem.uri,
        type: fileDinhKem.type || "application/octet-stream",
        name: fileDinhKem.name || "file_upload",
      });
    }

    const url = `${BASE_URL}/Edit/${id}`;

    console.log("CALL API:", url);

    const res = await fetch(url, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    });

    const text = await res.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch (e) {
      console.log("UPDATE RAW RESPONSE:", text);
      throw new Error("Server không trả JSON khi sửa thông báo.");
    }

    console.log("UPDATE RESPONSE:", data);

    if (!res.ok) {
      throw new Error(data?.message || data?.Message || "Update API error");
    }

    return data;
  } catch (err) {
    console.log("UPDATE THONG BAO ERROR:", err.message);
    throw err;
  }
};

/* ================= DELETE ================= */
export const deleteThongBaoGV = async (id, userId) => {
  console.log("DELETE USER ID:", userId);

  const url =
    `${BASE_URL}/Delete/${id}?userId=${encodeURIComponent(userId || "")}`;

  return safeFetch(url, {
    method: "POST",
  });
};

/* ================= UPLOAD IMAGE / FILE ================= */
export const uploadThongBaoImage = async (file) => {
  try {
    const formData = new FormData();

    formData.append("file", {
      uri: file.uri,
      type: file.type || "application/octet-stream",
      name: file.name || "file_upload",
    });

    const url = `${BASE_URL}/UploadImage`;

    console.log("CALL API:", url);

    const res = await fetch(url, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    });

    const text = await res.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch (e) {
      console.log("UPLOAD RAW RESPONSE:", text);
      throw new Error("Server không trả JSON khi upload file.");
    }

    console.log("UPLOAD RESPONSE:", data);

    if (!res.ok) {
      throw new Error(data?.message || data?.Message || "Upload API error");
    }

    return data;
  } catch (err) {
    console.log("UPLOAD IMAGE ERROR:", err.message);
    throw err;
  }
};