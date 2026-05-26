import { API_URL } from "./config";

const BASE_URL = `${API_URL}/api/dethi`;

// =====================
// HELPER FETCH
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
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      console.log("❌ JSON ERROR:", text);
      throw new Error("Server trả về dữ liệu không hợp lệ");
    }

    if (!res.ok) {
      console.log("❌ API ERROR:", data);

      throw new Error(
        data?.Message ||
          data?.message ||
          data ||
          "Request thất bại"
      );
    }

    return data;
  } catch (err) {
    console.log("❌ NETWORK ERROR:", err.message);

    throw new Error(
      err.message || "Không thể kết nối server"
    );
  }
};

// =====================
// 1. DANH SÁCH ĐỀ THI
// =====================
export const getDeThiList = async (userId) => {
  if (!userId) {
    throw new Error("Thiếu userId");
  }

  return safeFetch(
    `${BASE_URL}/list?userId=${userId}`,
    {
      method: "GET",
    }
  );
};

// =====================
// 2. CHI TIẾT ĐỀ THI
// =====================
export const getDeThiDetail = async (
  id,
  userId
) => {
  if (!id) {
    throw new Error("Thiếu mã đề");
  }

  if (!userId) {
    throw new Error("Thiếu userId");
  }

  return safeFetch(
    `${BASE_URL}/detail/${id}?userId=${userId}`,
    {
      method: "GET",
    }
  );
};

// =====================
// 3. TẠO ĐỀ THI
// =====================
export const createDeThi = async (
  payload
) => {
  if (!payload.TenDe) {
    throw new Error("Thiếu tên đề");
  }

  if (!payload.MaMonHoc) {
    throw new Error("Thiếu môn học");
  }

  if (!payload.UserId) {
    throw new Error("Thiếu userId");
  }

  if (!payload.Kieu) {
    throw new Error("Thiếu kiểu tạo đề");
  }

  // ===== MANUAL =====
  if (
    payload.Kieu === "manual" &&
    (!payload.SelectedCauHoi ||
      payload.SelectedCauHoi.length === 0)
  ) {
    throw new Error("Chưa chọn câu hỏi");
  }

  // ===== AUTO =====
  if (payload.Kieu === "auto") {
    if (
      payload.SoCauDe < 0 ||
      payload.SoCauTrungBinh < 0 ||
      payload.SoCauKho < 0
    ) {
      throw new Error(
        "Số lượng câu hỏi không hợp lệ"
      );
    }
  }

  if (!payload.ThoiGianBatDau) {
    throw new Error(
      "Thiếu thời gian bắt đầu"
    );
  }

  if (!payload.ThoiGianKetThuc) {
    throw new Error(
      "Thiếu thời gian kết thúc"
    );
  }

  if (!payload.ThoiGianThi) {
    throw new Error(
      "Thiếu thời gian thi"
    );
  }

  return safeFetch(`${BASE_URL}/create`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

// =====================
// 4. UPDATE ĐỀ THI
// =====================
export const updateDeThi = async (
  payload
) => {
  if (!payload.MaDe) {
    throw new Error("Thiếu mã đề");
  }

  return safeFetch(`${BASE_URL}/update`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

// =====================
// 5. XÓA ĐỀ THI
// =====================
export const deleteDeThi = async (
  id,
  userId
) => {
  if (!id) {
    throw new Error("Thiếu mã đề");
  }

  if (!userId) {
    throw new Error("Thiếu userId");
  }

  return safeFetch(
    `${BASE_URL}/delete/${id}?userId=${userId}`,
    {
      method: "POST",
    }
  );
};

// =====================
// 6. LẤY MÔN HỌC
// =====================
export const getMonHocByUser = async (
  userId
) => {
  if (!userId) {
    throw new Error("Thiếu userId");
  }

  return safeFetch(
    `${BASE_URL}/monhoc?userId=${userId}`,
    {
      method: "GET",
    }
  );
};

// =====================
// 7. LẤY NHÓM THEO MÔN
// =====================
export const getNhomByMon = async (
  maMon,
  userId
) => {
  if (!maMon) {
    throw new Error("Thiếu mã môn");
  }

  if (!userId) {
    throw new Error("Thiếu userId");
  }

  return safeFetch(
    `${BASE_URL}/nhom?maMon=${maMon}&userId=${userId}`,
    {
      method: "GET",
    }
  );
};

// =====================
// 8. LẤY CÂU HỎI THEO MÔN
// =====================
export const getCauHoiByMon = async (
  maMon,
  userId
) => {
  if (!maMon) {
    throw new Error("Thiếu mã môn");
  }

  if (!userId) {
    throw new Error("Thiếu userId");
  }

  return safeFetch(
    `${BASE_URL}/cauhoi?maMon=${maMon}&userId=${userId}`,
    {
      method: "GET",
    }
  );
};