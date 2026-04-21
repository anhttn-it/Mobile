import { API_URL } from "./config";

/* ================= NHÓM THEO GIẢNG VIÊN ================= */
export const getNhomByMon = async (maMonHoc, userId) => {
  const res = await fetch(
    `${API_URL}/api/nhom?userId=${userId}`
  );

  const json = await res.json();

  // lọc theo môn
  return json.filter(x => x.MaMonHoc === maMonHoc);
};

/* ================= ĐỀ THI ================= */
export const getDeThi = async (userId, maNhom) => {
  const res = await fetch(
    `${API_URL}/api/dethi/list?userId=${userId}`
  );

  const json = await res.json();

  const data = json.data || json;

  // lọc theo nhóm
  return data.filter(x => x.MaNhom === maNhom);
};
/* ================= ĐÃ NỘP ================= */
export const getDaNop = async (maDe) => {
  const res = await fetch(`${API_URL}/api/ketqua/danop?maDe=${maDe}`);
  return res.json();
};

/* ================= CHƯA NỘP ================= */
export const getChuaNop = async (maDe, maNhom) => {
  const res = await fetch(
    `${API_URL}/api/ketqua/chuanop?maDe=${maDe}&maNhom=${maNhom}`
  );
  return res.json();
};

/* ================= THỐNG KÊ ================= */
export const getThongKe = async (maDe) => {
  const res = await fetch(`${API_URL}/api/diem/thongke?maDe=${maDe}`);
  return res.json();
};

/* ================= EXPORT ================= */
export const exportCSVUrl = (maDe) =>
  `${API_URL}/api/diem/exportcsv?maDe=${maDe}`;

/* ================= CHI TIẾT BÀI LÀM ================= */
export const getChiTiet = async (maKetQua) => {
  const res = await fetch(
    `${API_URL}/api/ketqua/chitiet?maKetQua=${maKetQua}`
  );
  return res.json();
};