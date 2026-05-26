import { API_URL } from "./config";

const BASE_URL =
  `${API_URL}/api/QuanLyDiemApi`;

const safeFetch = async (
  url,
  options = {}
) => {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type":
          "application/json",
        Accept: "application/json",
        "ngrok-skip-browser-warning":
          "true",
      },
    });

    const text = await res.text();

    let data = null;

    try {
      data = text
        ? JSON.parse(text)
        : null;
    } catch {
      throw new Error(
        "Server trả dữ liệu lỗi"
      );
    }

    if (!res.ok) {
      throw new Error(
        data?.Message ||
          data?.message ||
          "API lỗi"
      );
    }

    return data;
  } catch (err) {
    console.log(
      "QUANLYDIEM API ERROR:",
      err.message
    );

    throw err;
  }
};

// ================= MÔN HỌC =================

export const getMonHocDiem =
  async (userId) => {
    return safeFetch(
      `${BASE_URL}/MonHoc?userId=${userId}`,
      {
        method: "GET",
      }
    );
  };

// ================= NHÓM =================

export const getNhomTheoMon =
  async (
    userId,
    maMonHoc
  ) => {
    return safeFetch(
      `${BASE_URL}/NhomTheoMon?userId=${userId}&maMonHoc=${maMonHoc}`,
      {
        method: "GET",
      }
    );
  };

// ================= ĐỀ =================

export const getDanhSachDe =
  async (maNhom) => {
    return safeFetch(
      `${BASE_URL}/DanhSachDe?maNhom=${maNhom}`,
      {
        method: "GET",
      }
    );
  };

// ================= ĐÃ NỘP =================

export const getDaNop =
  async (maDe) => {
    return safeFetch(
      `${BASE_URL}/DaNop?maDe=${maDe}`,
      {
        method: "GET",
      }
    );
  };

// ================= CHƯA NỘP =================

export const getChuaNop =
  async (
    maDe,
    maNhom
  ) => {
    return safeFetch(
      `${BASE_URL}/ChuaNop?maDe=${maDe}&maNhom=${maNhom}`,
      {
        method: "GET",
      }
    );
  };

// ================= THỐNG KÊ ĐIỂM =================

export const getThongKeDiem =
  async (maDe) => {
    return safeFetch(
      `${BASE_URL}/ThongKeDiem?maDe=${maDe}`,
      {
        method: "GET",
      }
    );
  };

// ================= THỐNG KÊ CÂU HỎI =================

export const getThongKeCauHoi =
  async (maDe) => {
    return safeFetch(
      `${BASE_URL}/ThongKeCauHoi?maDe=${maDe}`,
      {
        method: "GET",
      }
    );
  };

// ================= CHI TIẾT =================

export const getChiTietBaiLam =
  async (maKetQua) => {
    return safeFetch(
      `${BASE_URL}/ChiTietBaiLam?maKetQua=${maKetQua}`,
      {
        method: "GET",
      }
    );
  };