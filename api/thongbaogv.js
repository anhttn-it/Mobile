import { Alert, Linking } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { API_URL } from "./config";

const BASE_URL = `${API_URL}/api/ThongBaoGVApi`;

// =====================================================
// HELPER: MESSAGE / ERROR
// =====================================================

const getApiMessage = (data, fallback = "Request lỗi") => {
  if (!data) return fallback;

  return (
    data.message ||
    data.Message ||
    data.error ||
    data.Error ||
    data.title ||
    fallback
  );
};

const throwError = (message) => {
  throw new Error(message || "Có lỗi xảy ra");
};

const isEmptyText = (value) => {
  return !value || !String(value).trim();
};

const toIntArray = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((x) => parseInt(x, 10))
      .filter((x) => !Number.isNaN(x));
  }

  const n = parseInt(value, 10);
  return Number.isNaN(n) ? [] : [n];
};

// =====================================================
// HELPER: SAFE FETCH JSON
// =====================================================

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

    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      throw new Error(text || "Response không phải JSON");
    }

    if (!res.ok) {
      throw new Error(getApiMessage(data, `HTTP ${res.status}`));
    }

    if (data && data.success === false) {
      throw new Error(getApiMessage(data));
    }

    return data;
  } catch (err) {
    throw err;
  }
};

// =====================================================
// HELPER: SAFE FETCH FORM DATA
// KHÔNG set Content-Type khi upload FormData.
// React Native/fetch sẽ tự gắn boundary.
// =====================================================

const safeUploadFetch = async (url, formData) => {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: formData,
    });

    const text = await res.text();

    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      throw new Error(text || "Response không phải JSON");
    }

    if (!res.ok) {
      throw new Error(getApiMessage(data, `HTTP ${res.status}`));
    }

    if (data && data.success === false) {
      throw new Error(getApiMessage(data));
    }

    return data;
  } catch (err) {
    throw err;
  }
};

// =====================================================
// HELPER: FILE
// Hỗ trợ file từ expo-image-picker, expo-document-picker,
// hoặc object tự tạo: { uri, name, type }
// =====================================================

const getFileNameFromUri = (uri = "") => {
  if (!uri) return `thongbao_${Date.now()}.jpg`;

  const cleanUri = uri.split("?")[0];
  const parts = cleanUri.split("/");
  const name = parts[parts.length - 1];

  return name || `thongbao_${Date.now()}.jpg`;
};

const getMimeTypeFromFileName = (fileName = "") => {
  const lower = fileName.toLowerCase();

  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".doc")) return "application/msword";
  if (lower.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (lower.endsWith(".xls")) return "application/vnd.ms-excel";
  if (lower.endsWith(".xlsx")) {
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }
  if (lower.endsWith(".ppt")) return "application/vnd.ms-powerpoint";
  if (lower.endsWith(".pptx")) {
    return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  }
  if (lower.endsWith(".csv")) return "text/csv";
  if (lower.endsWith(".txt")) return "text/plain";

  return "application/octet-stream";
};

export const normalizeUploadFile = (file) => {
  if (!file) {
    throwError("Chưa chọn file");
  }

  // expo-document-picker có thể trả: { assets: [{ uri, name, mimeType, size }] }
  if (file.assets && Array.isArray(file.assets) && file.assets.length > 0) {
    file = file.assets[0];
  }

  // expo-image-picker thường trả asset: { uri, fileName, mimeType, type }
  const uri = file.uri;

  if (!uri) {
    throwError("File không hợp lệ");
  }

  const name = file.name || file.fileName || getFileNameFromUri(uri);
  const type = file.mimeType || file.type || getMimeTypeFromFileName(name);

  return {
    uri,
    name,
    type,
  };
};

const getFileKindFromMime = (mimeType = "") => {
  if (mimeType && String(mimeType).startsWith("image/")) return "image";
  return "file";
};

const getFileKindFromUrl = (url = "") => {
  const clean = String(url).split("?")[0].toLowerCase();

  if (
    clean.endsWith(".jpg") ||
    clean.endsWith(".jpeg") ||
    clean.endsWith(".png") ||
    clean.endsWith(".gif") ||
    clean.endsWith(".webp")
  ) {
    return "image";
  }

  return "file";
};

const getNameFromUrl = (url = "") => {
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/");
    const last = parts[parts.length - 1];
    return decodeURIComponent(last || "Liên kết");
  } catch {
    return "Liên kết";
  }
};

const isValidHttpUrl = (url = "") => {
  try {
    const u = new URL(String(url).trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

// =====================================================
// ATTACHMENT FORMAT
// FileDinhKem sẽ lưu JSON string:
// [
//   { type:"image", url:"https://...", name:"a.jpg" },
//   { type:"file",  url:"https://...", name:"tailieu.pdf" },
//   { type:"link",  url:"https://...", name:"Google Meet" }
// ]
//
// Vẫn tương thích dữ liệu cũ:
// - FileDinhKem = "https://..."
// - FileDinhKem = "/Uploads/ThongBao/a.jpg"
// - NoiDung cũ chứa <img src="/Uploads/...">
// =====================================================

export const createAttachment = ({
  type = "file",
  url = "",
  name = "",
  publicId = "",
  mimeType = "",
  resourceType = "",
  bytes = null,
  width = null,
  height = null,
} = {}) => {
  const cleanUrl = String(url || "").trim();

  if (!cleanUrl) {
    throwError("Đường dẫn tệp không hợp lệ");
  }

  return {
    type,
    url: cleanUrl,
    name: name || getNameFromUrl(cleanUrl),
    publicId: publicId || "",
    mimeType: mimeType || "",
    resourceType: resourceType || "",
    bytes,
    width,
    height,
  };
};

export const createLinkAttachment = (url, name = "") => {
  const cleanUrl = String(url || "").trim();

  if (!isValidHttpUrl(cleanUrl)) {
    throwError("Link không hợp lệ. Link phải bắt đầu bằng http:// hoặc https://");
  }

  return createAttachment({
    type: "link",
    url: cleanUrl,
    name: name || cleanUrl,
    resourceType: "link",
  });
};

export const normalizeAttachment = (att) => {
  if (!att) return null;

  if (typeof att === "string") {
    const url = att.trim();
    if (!url) return null;

    return createAttachment({
      type: getFileKindFromUrl(url),
      url,
      name: getNameFromUrl(url),
    });
  }

  const url = att.url || att.secureUrl || att.directUrl || att.downloadUrl;

  if (!url) return null;

  const type =
    att.type ||
    (att.resourceType === "image" ? "image" : "") ||
    getFileKindFromMime(att.mimeType || "") ||
    getFileKindFromUrl(url);

  return createAttachment({
    type,
    url,
    name: att.name || att.fileName || att.originalFileName || getNameFromUrl(url),
    publicId: att.publicId || "",
    mimeType: att.mimeType || "",
    resourceType: att.resourceType || "",
    bytes: att.bytes ?? null,
    width: att.width ?? null,
    height: att.height ?? null,
  });
};

export const parseAttachments = (fileDinhKem = "") => {
  if (!fileDinhKem) return [];

  if (Array.isArray(fileDinhKem)) {
    return fileDinhKem.map(normalizeAttachment).filter(Boolean);
  }

  const text = String(fileDinhKem).trim();

  if (!text) return [];

  // Dạng JSON array/object mới
  try {
    const parsed = JSON.parse(text);

    if (Array.isArray(parsed)) {
      return parsed.map(normalizeAttachment).filter(Boolean);
    }

    const one = normalizeAttachment(parsed);
    return one ? [one] : [];
  } catch {
    // Không phải JSON thì xử lý tiếp.
  }

  // Dữ liệu cũ có thể chứa HTML img
  const imgSrcRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  const foundImages = [];
  let match;

  while ((match = imgSrcRegex.exec(text)) !== null) {
    if (match[1]) {
      foundImages.push(
        createAttachment({
          type: "image",
          url: match[1],
          name: getNameFromUrl(match[1]),
        })
      );
    }
  }

  if (foundImages.length > 0) {
    return foundImages;
  }

  // Dữ liệu cũ là 1 link duy nhất
  return [
    createAttachment({
      type: getFileKindFromUrl(text),
      url: text,
      name: getNameFromUrl(text),
    }),
  ];
};

export const stringifyAttachments = (attachments = []) => {
  const clean = (attachments || [])
    .map(normalizeAttachment)
    .filter(Boolean);

  if (clean.length === 0) return "";

  return JSON.stringify(clean);
};

export const mergeAttachments = (...attachmentGroups) => {
  const merged = [];

  attachmentGroups.forEach((group) => {
    if (!group) return;

    if (Array.isArray(group)) {
      group.forEach((x) => {
        const att = normalizeAttachment(x);
        if (att) merged.push(att);
      });
    } else {
      const parsed = parseAttachments(group);
      parsed.forEach((att) => merged.push(att));
    }
  });

  // Loại trùng URL
  const seen = new Set();

  return merged.filter((att) => {
    if (!att.url) return false;
    if (seen.has(att.url)) return false;
    seen.add(att.url);
    return true;
  });
};

export const removeAttachmentAt = (attachments = [], index) => {
  return (attachments || []).filter((_, i) => i !== index);
};

export const stripHtml = (html = "") => {
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

// =====================================================
// VALIDATE CREATE / EDIT
// Giữ đúng nghiệp vụ controller:
// - Phải có userId
// - Nội dung không được rỗng
// - Phải chọn ít nhất 1 nhóm-môn
// - FileDinhKem không bắt buộc
// =====================================================

export const validateThongBaoPayload = (payload = {}, isEdit = false) => {
  const errors = {};

  const userId = payload.userId || payload.UserId;
  const id = payload.id || payload.Id;
  const noiDung = payload.noiDung ?? payload.NoiDung;
  const maNhom = payload.maNhom ?? payload.MaNhom;

  if (isEmptyText(userId)) {
    errors.userId = "Chưa đăng nhập";
  }

  if (isEdit && (!id || Number.isNaN(parseInt(id, 10)))) {
    errors.id = "Thiếu mã thông báo";
  }

  if (isEmptyText(noiDung)) {
    errors.noiDung = "Vui lòng nhập nội dung thông báo";
  }

  if (toIntArray(maNhom).length === 0) {
    errors.maNhom = "Vui lòng chọn ít nhất một nhóm-môn";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

const buildThongBaoBody = (payload = {}, isEdit = false) => {
  const validation = validateThongBaoPayload(payload, isEdit);

  if (!validation.isValid) {
    const firstMessage =
      validation.errors.noiDung ||
      validation.errors.maNhom ||
      validation.errors.id ||
      validation.errors.userId ||
      "Dữ liệu không hợp lệ";

    const err = new Error(firstMessage);
    err.errors = validation.errors;
    throw err;
  }

  const attachmentsFromArray = payload.attachments ?? payload.Attachments;
  const fileDinhKem =
    payload.fileDinhKem ??
    payload.FileDinhKem ??
    stringifyAttachments(attachmentsFromArray || []);

  const body = {
    UserId: payload.userId || payload.UserId,
    NoiDung: String(payload.noiDung ?? payload.NoiDung).trim(),
    MaNhom: toIntArray(payload.maNhom ?? payload.MaNhom),
    FileDinhKem: fileDinhKem || "",
  };

  if (isEdit) {
    body.Id = parseInt(payload.id || payload.Id, 10);
  }

  return body;
};

// =====================================================
// 1. GET DANH SÁCH THÔNG BÁO GIẢNG VIÊN
// GET /api/ThongBaoGVApi/Index?userId=...&search=...
// =====================================================

export const getThongBaoGV = async (userId, search = "") => {
  if (isEmptyText(userId)) {
    throwError("Chưa đăng nhập");
  }

  let url = `${BASE_URL}/Index?userId=${encodeURIComponent(userId)}`;

  if (!isEmptyText(search)) {
    url += `&search=${encodeURIComponent(String(search).trim())}`;
  }

  return safeFetch(url, {
    method: "GET",
  });
};

export const getThongBaoGVIndex = getThongBaoGV;

// =====================================================
// 2. GET NHÓM-MÔN CỦA GIẢNG VIÊN
// GET /api/ThongBaoGVApi/Nhom?userId=...
// =====================================================

export const getNhomThongBaoGV = async (userId) => {
  if (isEmptyText(userId)) {
    throwError("Chưa đăng nhập");
  }

  return safeFetch(`${BASE_URL}/Nhom?userId=${encodeURIComponent(userId)}`, {
    method: "GET",
  });
};

export const getNhomGV = getNhomThongBaoGV;

// =====================================================
// 3. DETAIL
// GET /api/ThongBaoGVApi/Detail?userId=...&id=...
// =====================================================

export const getThongBaoGVDetail = async (userId, id) => {
  if (isEmptyText(userId)) {
    throwError("Chưa đăng nhập");
  }

  if (!id) {
    throwError("Thiếu mã thông báo");
  }

  return safeFetch(
    `${BASE_URL}/Detail?userId=${encodeURIComponent(userId)}&id=${encodeURIComponent(id)}`,
    { method: "GET" }
  );
};

// =====================================================
// 4. GET EDIT DATA
// GET /api/ThongBaoGVApi/Edit?userId=...&id=...
// =====================================================

export const getThongBaoGVEdit = async (userId, id) => {
  if (isEmptyText(userId)) {
    throwError("Chưa đăng nhập");
  }

  if (!id) {
    throwError("Thiếu mã thông báo");
  }

  return safeFetch(
    `${BASE_URL}/Edit?userId=${encodeURIComponent(userId)}&id=${encodeURIComponent(id)}`,
    { method: "GET" }
  );
};

// =====================================================
// 5. UPLOAD 1 FILE CLOUDINARY
// POST /api/ThongBaoGVApi/UploadFile?userId=...
// form-data key: file
// =====================================================

export const uploadThongBaoFile = async (userId, file) => {
  if (isEmptyText(userId)) {
    throwError("Chưa đăng nhập");
  }

  const normalizedFile = normalizeUploadFile(file);

  const formData = new FormData();
  formData.append("file", normalizedFile);

  return safeUploadFetch(
    `${BASE_URL}/UploadFile?userId=${encodeURIComponent(userId)}`,
    formData
  );
};

export const uploadThongBaoCloudinary = uploadThongBaoFile;

// =====================================================
// 6. UPLOAD NHIỀU FILE/ẢNH
// - Chạy tuần tự để dễ bắt lỗi và nhẹ server.
// - Trả về mảng attachment đã chuẩn hóa.
// =====================================================

export const uploadThongBaoFiles = async (userId, files = []) => {
  if (isEmptyText(userId)) {
    throwError("Chưa đăng nhập");
  }

  if (!Array.isArray(files) || files.length === 0) {
    return [];
  }

  const uploaded = [];

  for (const file of files) {
    const res = await uploadThongBaoFile(userId, file);
    const data = res?.data || res?.Data;

    const att = normalizeAttachment({
      type:
        data?.resourceType === "image"
          ? "image"
          : getFileKindFromMime(data?.mimeType || ""),
      url: data?.url || data?.secureUrl,
      name: data?.originalFileName || data?.fileName,
      publicId: data?.publicId,
      mimeType: data?.mimeType,
      resourceType: data?.resourceType,
      bytes: data?.bytes,
      width: data?.width,
      height: data?.height,
    });

    if (att) uploaded.push(att);
  }

  return uploaded;
};

// =====================================================
// 7. CHUẨN BỊ FILEDINHKEM TỪ NHIỀU ẢNH/FILE/LINK
// files: mảng file local cần upload
// links: mảng string hoặc {url,name}
// existingAttachments: mảng attachment đang có sẵn khi edit
// =====================================================

export const prepareThongBaoAttachments = async (
  userId,
  {
    files = [],
    links = [],
    existingAttachments = [],
  } = {}
) => {
  const uploadedAttachments = await uploadThongBaoFiles(userId, files);

  const linkAttachments = (links || [])
    .map((x) => {
      if (!x) return null;

      if (typeof x === "string") {
        if (isEmptyText(x)) return null;
        return createLinkAttachment(x);
      }

      const url = x.url || x.Url || "";
      const name = x.name || x.Name || "";
      if (isEmptyText(url)) return null;

      return createLinkAttachment(url, name);
    })
    .filter(Boolean);

  return mergeAttachments(existingAttachments, uploadedAttachments, linkAttachments);
};

export const buildFileDinhKemJson = stringifyAttachments;

// =====================================================
// 8. CREATE
// POST /api/ThongBaoGVApi/Create
// =====================================================

export const createThongBaoGV = async (payload = {}) => {
  const body = buildThongBaoBody(payload, false);

  return safeFetch(`${BASE_URL}/Create`, {
    method: "POST",
    body: JSON.stringify(body),
  });
};

// CREATE + tự upload nhiều ảnh/file/link
export const createThongBaoGVFull = async ({
  userId,
  noiDung,
  maNhom,
  files = [],
  links = [],
  attachments = [],
} = {}) => {
  const finalAttachments = await prepareThongBaoAttachments(userId, {
    files,
    links,
    existingAttachments: attachments,
  });

  return createThongBaoGV({
    userId,
    noiDung,
    maNhom,
    attachments: finalAttachments,
  });
};

// =====================================================
// 9. EDIT
// POST /api/ThongBaoGVApi/Edit
// =====================================================

export const editThongBaoGV = async (payload = {}) => {
  const body = buildThongBaoBody(payload, true);

  return safeFetch(`${BASE_URL}/Edit`, {
    method: "POST",
    body: JSON.stringify(body),
  });
};

// EDIT + tự upload thêm nhiều ảnh/file/link
export const editThongBaoGVFull = async ({
  id,
  userId,
  noiDung,
  maNhom,
  files = [],
  links = [],
  existingAttachments = [],
} = {}) => {
  const finalAttachments = await prepareThongBaoAttachments(userId, {
    files,
    links,
    existingAttachments,
  });

  return editThongBaoGV({
    id,
    userId,
    noiDung,
    maNhom,
    attachments: finalAttachments,
  });
};

// =====================================================
// 10. DELETE
// POST /api/ThongBaoGVApi/DeleteConfirmed
// =====================================================

export const deleteThongBaoGV = async (userId, id) => {
  if (isEmptyText(userId)) {
    throwError("Chưa đăng nhập");
  }

  if (!id) {
    throwError("Thiếu mã thông báo");
  }

  return safeFetch(`${BASE_URL}/DeleteConfirmed`, {
    method: "POST",
    body: JSON.stringify({
      UserId: userId,
      Id: parseInt(id, 10),
    }),
  });
};

// =====================================================
// 11. TEST CLOUDINARY CONFIG
// GET /api/ThongBaoGVApi/TestCloudinaryConfig
// =====================================================

export const testCloudinaryConfig = async () => {
  return safeFetch(`${BASE_URL}/TestCloudinaryConfig`, {
    method: "GET",
  });
};

// =====================================================
// HELPER DISPLAY CHO SCREEN
// =====================================================

export const getThongBaoId = (item) => {
  return item?.MaThongBao ?? item?.maThongBao ?? item?.id ?? item?.Id;
};

export const getThongBaoContent = (item) => {
  return item?.NoiDung ?? item?.noiDung ?? "";
};

export const getThongBaoFileUrl = (item) => {
  return item?.FileDinhKem ?? item?.fileDinhKem ?? "";
};

export const getThongBaoAttachments = (item) => {
  return parseAttachments(getThongBaoFileUrl(item));
};

export const getThongBaoGroups = (item) => {
  return item?.Nhoms ?? item?.nhoms ?? [];
};

export const getNhomLabel = (group) => {
  if (!group) return "Chưa có nhóm";

  const tenNhom = group.TenNhom || group.tenNhom || "Chưa có nhóm";
  const tenMon =
    group.TenMonHoc ||
    group.tenMonHoc ||
    group.TenMon ||
    group.tenMon ||
    "Chưa có môn";

  return `${tenNhom} - ${tenMon}`;
};

// =====================================================
// CAMERA / IMAGE / FILE PICKER HELPERS
// Đặt chung trong 1 file để screen chỉ cần import từ thongbaogv.js
// =====================================================

// =====================================================
// HELPER: PERMISSION
// =====================================================

const openAppSettings = () => {
  Linking.openSettings();
};

const ensureCameraPermission = async () => {
  const current = await ImagePicker.getCameraPermissionsAsync();

  if (current.granted) return true;

  const asked = await ImagePicker.requestCameraPermissionsAsync();

  if (asked.granted) return true;

  Alert.alert(
    "Thiếu quyền camera",
    "Bạn cần cấp quyền camera để chụp ảnh thông báo.",
    [
      { text: "Hủy", style: "cancel" },
      { text: "Mở cài đặt", onPress: openAppSettings },
    ]
  );

  return false;
};

const ensureMediaPermission = async () => {
  const current = await ImagePicker.getMediaLibraryPermissionsAsync();

  if (current.granted) return true;

  const asked = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (asked.granted) return true;

  Alert.alert(
    "Thiếu quyền thư viện ảnh",
    "Bạn cần cấp quyền truy cập ảnh để chọn ảnh thông báo.",
    [
      { text: "Hủy", style: "cancel" },
      { text: "Mở cài đặt", onPress: openAppSettings },
    ]
  );

  return false;
};

// =====================================================
// HELPER: NORMALIZE ASSETS
// =====================================================

const getPickerFileNameFromUri = (uri = "") => {
  if (!uri) return `photo_${Date.now()}.jpg`;

  const cleanUri = uri.split("?")[0];
  const parts = cleanUri.split("/");
  const name = parts[parts.length - 1];

  return name || `photo_${Date.now()}.jpg`;
};

const normalizeImageAsset = (asset) => {
  if (!asset || !asset.uri) return null;

  const name =
    asset.fileName ||
    asset.name ||
    getPickerFileNameFromUri(asset.uri);

  return {
    uri: asset.uri,
    name,
    type: asset.mimeType || "image/jpeg",
    width: asset.width,
    height: asset.height,
    kind: "image",
  };
};

const normalizeDocumentAsset = (asset) => {
  if (!asset || !asset.uri) return null;

  return {
    uri: asset.uri,
    name: asset.name || getPickerFileNameFromUri(asset.uri),
    type: asset.mimeType || "application/octet-stream",
    size: asset.size,
    kind: "file",
  };
};

// =====================================================
// 1. MỞ CAMERA CHỤP 1 ẢNH
// =====================================================

export const takeThongBaoPhoto = async () => {
  const ok = await ensureCameraPermission();

  if (!ok) return null;

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images"],
    allowsEditing: false,
    quality: 0.8,
  });

  if (result.canceled) return null;

  const asset = result.assets && result.assets.length > 0
    ? result.assets[0]
    : null;

  return normalizeImageAsset(asset);
};

// =====================================================
// 2. CHỌN 1 HOẶC NHIỀU ẢNH TỪ THƯ VIỆN
// =====================================================

export const pickThongBaoImages = async () => {
  const ok = await ensureMediaPermission();

  if (!ok) return [];

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: false,
    allowsMultipleSelection: true,
    selectionLimit: 10,
    quality: 0.8,
  });

  if (result.canceled) return [];

  return (result.assets || [])
    .map(normalizeImageAsset)
    .filter(Boolean);
};

// =====================================================
// 3. CHỌN 1 HOẶC NHIỀU FILE
// =====================================================

export const pickThongBaoFiles = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    multiple: true,
    copyToCacheDirectory: true,
    type: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
      "text/csv",
      "image/*",
    ],
  });

  if (result.canceled) return [];

  return (result.assets || [])
    .map(normalizeDocumentAsset)
    .filter(Boolean);
};

export default {
  takeThongBaoPhoto,
  pickThongBaoImages,
  pickThongBaoFiles,
  getThongBaoGV,
  getThongBaoGVIndex,
  getNhomThongBaoGV,
  getNhomGV,
  getThongBaoGVDetail,
  getThongBaoGVEdit,
  uploadThongBaoFile,
  uploadThongBaoCloudinary,
  uploadThongBaoFiles,
  prepareThongBaoAttachments,
  buildFileDinhKemJson,
  createThongBaoGV,
  createThongBaoGVFull,
  editThongBaoGV,
  editThongBaoGVFull,
  deleteThongBaoGV,
  testCloudinaryConfig,
  validateThongBaoPayload,
  createAttachment,
  createLinkAttachment,
  normalizeAttachment,
  parseAttachments,
  stringifyAttachments,
  mergeAttachments,
  removeAttachmentAt,
  getThongBaoId,
  getThongBaoContent,
  getThongBaoFileUrl,
  getThongBaoAttachments,
  getThongBaoGroups,
  getNhomLabel,
  stripHtml,
};
