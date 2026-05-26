import { API_URL } from "./config";

const API_ROOT = API_URL.replace(/\/$/, "");
const BASE_URL = `${API_ROOT}/api/ThongBaoSVApi`;

/* ================= HELPER ================= */

const isEmpty = (value) => {
  return !value || !String(value).trim();
};

const getApiMessage = (data, fallback = "Có lỗi xảy ra") => {
  return (
    data?.message ||
    data?.Message ||
    data?.error ||
    data?.Error ||
    fallback
  );
};

/* ================= SAFE FETCH ================= */

const safeFetch = async (url, options = {}) => {
  try {
    console.log("CALL API SV:", url);

    const res = await fetch(url, {
      ...options,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        ...(options.headers || {}),
      },
    });

    const text = await res.text();

    let data;

    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      console.log("SERVER RAW RESPONSE SV:", text);
      throw new Error("Server không trả JSON. Kiểm tra lại URL API.");
    }

    console.log("API SV RESPONSE:", data);

    if (!res.ok) {
      throw new Error(getApiMessage(data, `HTTP ${res.status}`));
    }

    if (data && data.success === false) {
      throw new Error(getApiMessage(data));
    }

    return data;
  } catch (err) {
    console.log("THONG BAO SV API ERROR:", err.message);
    throw err;
  }
};

/* ================= DANH SÁCH THÔNG BÁO ================= */
/*
GET: /api/ThongBaoSVApi/Index?userId=...&search=...
*/
export const getThongBaoSV = async (userId, search = "") => {
  if (isEmpty(userId)) {
    throw new Error("Chưa đăng nhập");
  }

  const url =
    `${BASE_URL}/Index?userId=${encodeURIComponent(userId)}` +
    `&search=${encodeURIComponent(search || "")}`;

  return safeFetch(url, {
    method: "GET",
  });
};

/* ================= CHI TIẾT THÔNG BÁO ================= */
/*
GET: /api/ThongBaoSVApi/Detail?id=...&userId=...
Khi gọi Detail, backend sẽ tự đánh dấu đã xem
*/
export const getThongBaoSVDetail = async (id, userId) => {
  if (isEmpty(userId)) {
    throw new Error("Chưa đăng nhập");
  }

  if (!id) {
    throw new Error("Thiếu mã thông báo");
  }

  const url =
    `${BASE_URL}/Detail?id=${encodeURIComponent(id)}` +
    `&userId=${encodeURIComponent(userId)}`;

  return safeFetch(url, {
    method: "GET",
  });
};

/* ================= ĐÁNH DẤU ĐÃ XEM ================= */
/*
POST: /api/ThongBaoSVApi/MarkRead?id=...&userId=...
*/
export const markThongBaoSVRead = async (id, userId) => {
  if (isEmpty(userId)) {
    throw new Error("Chưa đăng nhập");
  }

  if (!id) {
    throw new Error("Thiếu mã thông báo");
  }

  const url =
    `${BASE_URL}/MarkRead?id=${encodeURIComponent(id)}` +
    `&userId=${encodeURIComponent(userId)}`;

  return safeFetch(url, {
    method: "POST",
  });
};

/* ================= SỐ THÔNG BÁO CHƯA ĐỌC ================= */
/*
GET: /api/ThongBaoSVApi/UnreadCount?userId=...
*/
export const getThongBaoSVUnreadCount = async (userId) => {
  if (isEmpty(userId)) {
    throw new Error("Chưa đăng nhập");
  }

  const url = `${BASE_URL}/UnreadCount?userId=${encodeURIComponent(userId)}`;

  return safeFetch(url, {
    method: "GET",
  });
};

/* ================= LỚP - MÔN CỦA SINH VIÊN ================= */
/*
GET: /api/ThongBaoSVApi/GetNhom?userId=...
*/
export const getNhomSV = async (userId) => {
  if (isEmpty(userId)) {
    throw new Error("Chưa đăng nhập");
  }

  const url = `${BASE_URL}/GetNhom?userId=${encodeURIComponent(userId)}`;

  return safeFetch(url, {
    method: "GET",
  });
};

/* ================= HELPER DISPLAY ================= */

export const getThongBaoSVId = (item) => {
  return item?.MaThongBao ?? item?.maThongBao ?? item?.id ?? item?.Id;
};

export const getThongBaoSVContent = (item) => {
  return item?.NoiDung ?? item?.noiDung ?? "";
};

export const getThongBaoSVFile = (item) => {
  return item?.FileDinhKem ?? item?.fileDinhKem ?? "";
};

export const getThongBaoSVTeacher = (item) => {
  return (
    item?.TenGiangVien ||
    item?.tenGiangVien ||
    item?.NguoiTaoHoTen ||
    item?.nguoiTaoHoTen ||
    ""
  );
};

export const getThongBaoSVGroups = (item) => {
  return item?.Nhoms || item?.nhoms || item?.Nhom || item?.nhom || [];
};

export const getNhomSVLabel = (group) => {
  if (!group) return "Chưa có lớp - môn";

  return (
    group.TenLopMon ||
    group.tenLopMon ||
    group.TenHienThi ||
    group.tenHienThi ||
    `${group.TenNhom || group.tenNhom || "Chưa có lớp"} - ${
      group.TenMonHoc || group.tenMonHoc || "Chưa có môn"
    }`
  );
};

/* ================= XỬ LÝ NỘI DUNG CŨ HTML ================= */

export const stripHtmlSV = (html = "") => {
  if (!html) return "";

  return String(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<img[^>]*>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
};

const getNameFromUrl = (url = "") => {
  try {
    const u = new URL(url.startsWith("http") ? url : `${API_ROOT}${url}`);
    const parts = u.pathname.split("/");
    return decodeURIComponent(parts[parts.length - 1] || "Tệp đính kèm");
  } catch {
    return "Tệp đính kèm";
  }
};

const isImageUrl = (url = "") => {
  const clean = String(url).split("?")[0].toLowerCase();

  return (
    clean.endsWith(".jpg") ||
    clean.endsWith(".jpeg") ||
    clean.endsWith(".png") ||
    clean.endsWith(".gif") ||
    clean.endsWith(".webp")
  );
};

const isFileUrl = (url = "") => {
  const clean = String(url).split("?")[0].toLowerCase();

  return /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|txt|csv)$/i.test(clean);
};

const normalizeAttachment = (att) => {
  if (!att) return null;

  if (typeof att === "string") {
    const url = att.trim();

    if (!url) return null;

    return {
      type: isImageUrl(url) ? "image" : isFileUrl(url) ? "file" : "link",
      url,
      name: getNameFromUrl(url),
    };
  }

  const url = att.url || att.secureUrl || att.Url || att.DuongDan || "";

  if (!url) return null;

  return {
    type:
      att.type ||
      att.Loai ||
      (isImageUrl(url) ? "image" : isFileUrl(url) ? "file" : "link"),
    url,
    name:
      att.name ||
      att.fileName ||
      att.originalFileName ||
      att.TenTep ||
      getNameFromUrl(url),
    publicId: att.publicId || "",
    mimeType: att.mimeType || "",
    resourceType: att.resourceType || "",
    bytes: att.bytes ?? null,
    width: att.width ?? null,
    height: att.height ?? null,
  };
};

const parseHtmlAttachments = (html = "") => {
  if (!html) return [];

  const result = [];

  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let imgMatch;

  while ((imgMatch = imgRegex.exec(html)) !== null) {
    const url = imgMatch[1];

    if (url) {
      result.push({
        type: "image",
        url,
        name: getNameFromUrl(url),
      });
    }
  }

  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
  let linkMatch;

  while ((linkMatch = linkRegex.exec(html)) !== null) {
    const url = linkMatch[1];
    const text = String(linkMatch[2] || "")
      .replace(/<[^>]*>/g, "")
      .replace(/📎/g, "")
      .trim();

    if (!url) continue;

    result.push({
      type: isFileUrl(url) ? "file" : "link",
      url,
      name: text || getNameFromUrl(url),
    });
  }

  return result;
};

/* ================= PARSE FILEDINHKEM ================= */
/*
Hỗ trợ:
1. FileDinhKem = JSON string nhiều ảnh/file/link
2. FileDinhKem = 1 link Cloudinary
3. FileDinhKem = /Uploads/...
4. NoiDung cũ có <img> hoặc <a>
*/
export const parseThongBaoSVAttachments = (item) => {
  const fileDinhKem = getThongBaoSVFile(item);
  const noiDung = getThongBaoSVContent(item);

  let result = [];

  if (fileDinhKem) {
    const text = String(fileDinhKem).trim();

    try {
      const parsed = JSON.parse(text);

      if (Array.isArray(parsed)) {
        result = result.concat(parsed.map(normalizeAttachment).filter(Boolean));
      } else {
        const one = normalizeAttachment(parsed);
        if (one) result.push(one);
      }
    } catch {
      const one = normalizeAttachment(text);
      if (one) result.push(one);
    }
  }

  result = result.concat(parseHtmlAttachments(noiDung));

  const seen = new Set();

  return result.filter((att) => {
    if (!att || !att.url) return false;

    if (seen.has(att.url)) return false;

    seen.add(att.url);
    return true;
  });
};

export default {
  getThongBaoSV,
  getThongBaoSVDetail,
  markThongBaoSVRead,
  getThongBaoSVUnreadCount,
  getNhomSV,

  getThongBaoSVId,
  getThongBaoSVContent,
  getThongBaoSVFile,
  getThongBaoSVTeacher,
  getThongBaoSVGroups,
  getNhomSVLabel,
  stripHtmlSV,
  parseThongBaoSVAttachments,
};