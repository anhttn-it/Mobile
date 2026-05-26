import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Image,
  Linking,
  useWindowDimensions,
} from "react-native";

import RenderHTML from "react-native-render-html";

import MainLayout from "../../components/MainLayout";
import { AuthContext } from "../../context/AuthContext";
import { API_URL } from "../../api/config";

import {
  getThongBaoGV,
  createThongBaoGVFull,
  editThongBaoGVFull,
  deleteThongBaoGV,
  getThongBaoGVDetail,
  getNhomGV,
  getThongBaoAttachments,
  getThongBaoGroups,
  getNhomLabel,
  getThongBaoId,
  getThongBaoContent,
  stripHtml,
  takeThongBaoPhoto,
  pickThongBaoImages,
  pickThongBaoFiles,
  createLinkAttachment,
  removeAttachmentAt,
  mergeAttachments,
} from "../../api/thongbaogv";

const API_ROOT = API_URL.replace(/\/$/, "");

const getFullUrl = (url) => {
  if (!url) return "";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${API_ROOT}${url}`;
};

const isImageAttachment = (att) => {
  if (!att) return false;

  if (att.type === "image") return true;

  const url = String(att.url || "").split("?")[0].toLowerCase();

  return (
    url.endsWith(".jpg") ||
    url.endsWith(".jpeg") ||
    url.endsWith(".png") ||
    url.endsWith(".gif") ||
    url.endsWith(".webp")
  );
};

const isFileLikeUrl = (url = "") => {
  const clean = String(url).split("?")[0].toLowerCase();

  return /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|txt|csv)$/i.test(clean);
};

const getNameFromUrl = (url = "") => {
  try {
    const u = new URL(getFullUrl(url));
    const parts = u.pathname.split("/");
    const last = parts[parts.length - 1];
    return decodeURIComponent(last || "Liên kết");
  } catch {
    return "Liên kết";
  }
};

const getAttachmentIcon = (att) => {
  if (!att) return "📎";
  if (att.type === "image" || isImageAttachment(att)) return "🖼";
  if (att.type === "link") return "🔗";
  return "📎";
};

const getItemGroups = (item) => {
  const groups = getThongBaoGroups(item);

  if (groups && groups.length > 0) return groups;

  return item?.Nhom || item?.nhom || item?.Groups || item?.groups || [];
};

const extractAttachmentsFromHtml = (html = "") => {
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
      type: isFileLikeUrl(url) || text.includes(".") ? "file" : "link",
      url,
      name: text || getNameFromUrl(url),
    });
  }

  return result;
};

const getAllAttachments = (item) => {
  const fromFileDinhKem = getThongBaoAttachments(item);
  const fromOldHtml = extractAttachmentsFromHtml(getThongBaoContent(item));

  return mergeAttachments(fromFileDinhKem, fromOldHtml);
};

export default function ThongBaoGVScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const { width } = useWindowDimensions();

  const [list, setList] = useState([]);
  const [groups, setGroups] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [form, setForm] = useState({
    noiDung: "",
  });

  const [selectedNhom, setSelectedNhom] = useState([]);

  // Đính kèm đã lưu trong DB, dùng khi sửa.
  const [existingAttachments, setExistingAttachments] = useState([]);

  // File/ảnh local mới chọn, chỉ upload khi bấm lưu.
  const [selectedFiles, setSelectedFiles] = useState([]);

  // Link mới thêm.
  const [links, setLinks] = useState([]);

  const [linkModalVisible, setLinkModalVisible] = useState(false);
  const [linkInput, setLinkInput] = useState("");

  // ====================
  // LẤY MÃ GIẢNG VIÊN / USER ID
  // ====================
  const getCurrentUserId = () => {
    return (
      user?.userId ||
      user?.UserId ||
      user?.UserID ||
      user?.id ||
      user?.Id ||
      user?.ID ||
      user?.maNguoiDung ||
      user?.MaNguoiDung ||
      user?.nguoiDungId ||
      user?.NguoiDungId ||
      user?.maGiangVien ||
      user?.MaGiangVien ||
      user?.gvId ||
      user?.GVId ||
      ""
    );
  };

  // ====================
  // LOAD DATA
  // ====================
  const loadData = async () => {
    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
      setList([]);
      setGroups([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [tbData, nhomData] = await Promise.all([
        getThongBaoGV(currentUserId, search),
        getNhomGV(currentUserId),
      ]);

      if (tbData.success) {
        setList(tbData.data || tbData.Data || []);
      } else {
        Alert.alert("Lỗi", tbData.message || "Không lấy được thông báo");
      }

      if (nhomData.success) {
        setGroups(nhomData.data || nhomData.Data || []);
      } else {
        Alert.alert(
          "Lỗi",
          nhomData.message || "Không lấy được danh sách lớp - môn"
        );
      }
    } catch (err) {
      Alert.alert("Lỗi", err.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // ====================
  // REFRESH
  // ====================
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // ====================
  // SEARCH
  // ====================
  const handleSearch = async (text) => {
    setSearch(text);

    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
      setList([]);
      return;
    }

    try {
      const res = await getThongBaoGV(currentUserId, text);

      if (res.success) {
        setList(res.data || res.Data || []);
      } else {
        Alert.alert("Lỗi", res.message || "Không tìm kiếm được thông báo");
      }
    } catch (err) {
      Alert.alert("Lỗi", err.message || "Không thể tìm kiếm");
    }
  };

  // ====================
  // RESET FORM
  // ====================
  const resetForm = () => {
    setForm({
      noiDung: "",
    });

    setSelectedNhom([]);
    setExistingAttachments([]);
    setSelectedFiles([]);
    setLinks([]);
    setLinkInput("");
    setSelectedItem(null);
    setSaving(false);
  };

  // ====================
  // OPEN CREATE
  // ====================
  const openCreate = () => {
    resetForm();
    setEditMode(false);
    setModalVisible(true);
  };

  // ====================
  // OPEN EDIT
  // ====================
  const openEdit = (item) => {
    const groupsOfItem = getItemGroups(item);

    setSelectedItem(item);

    setForm({
      noiDung: stripHtml(getThongBaoContent(item) || ""),
    });

    setSelectedNhom(
      groupsOfItem
        .map((n) => n.MaNhom || n.maNhom)
        .filter(Boolean)
    );

    setExistingAttachments(getAllAttachments(item));
    setSelectedFiles([]);
    setLinks([]);

    setEditMode(true);
    setModalVisible(true);
  };

  // ====================
  // DETAIL
  // ====================
  const openDetail = async (id) => {
    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
      Alert.alert("Lỗi", "Không tìm thấy mã giảng viên");
      return;
    }

    try {
      const res = await getThongBaoGVDetail(currentUserId, id);

      if (res.success) {
        setSelectedItem(res.data || res.Data);
        setDetailVisible(true);
      } else {
        Alert.alert("Lỗi", res.message || "Không lấy được chi tiết");
      }
    } catch (err) {
      Alert.alert("Lỗi", err.message || "Không thể lấy chi tiết");
    }
  };

  // ====================
  // TOGGLE GROUP
  // ====================
  const toggleGroup = (id) => {
    if (selectedNhom.includes(id)) {
      setSelectedNhom(selectedNhom.filter((x) => x !== id));
    } else {
      setSelectedNhom([...selectedNhom, id]);
    }
  };

  // ====================
  // LINK
  // ====================
  const insertLink = () => {
    setLinkInput("");
    setLinkModalVisible(true);
  };

  const saveLink = () => {
    try {
      if (!linkInput.trim()) {
        Alert.alert("Thông báo", "Vui lòng nhập link");
        return;
      }

      const att = createLinkAttachment(linkInput.trim(), linkInput.trim());

      setLinks((prev) => [...prev, att]);
      setLinkInput("");
      setLinkModalVisible(false);
    } catch (err) {
      Alert.alert("Lỗi", err.message || "Link không hợp lệ");
    }
  };

  // ====================
  // CAMERA / IMAGE / FILE
  // ====================
  const handleTakePhoto = async () => {
    try {
      const photo = await takeThongBaoPhoto();

      if (photo) {
        setSelectedFiles((prev) => [...prev, photo]);
      }
    } catch (err) {
      Alert.alert("Lỗi", err.message || "Không thể mở camera");
    }
  };

  const chooseImage = async () => {
    try {
      const images = await pickThongBaoImages();

      if (images.length > 0) {
        setSelectedFiles((prev) => [...prev, ...images]);
      }
    } catch (err) {
      Alert.alert("Lỗi", err.message || "Không thể chọn ảnh");
    }
  };

  const chooseFile = async () => {
    try {
      const files = await pickThongBaoFiles();

      if (files.length > 0) {
        setSelectedFiles((prev) => [...prev, ...files]);
      }
    } catch (err) {
      Alert.alert("Lỗi", err.message || "Không thể chọn file");
    }
  };

  const removeExistingAttachment = (index) => {
    setExistingAttachments((prev) => removeAttachmentAt(prev, index));
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeLink = (index) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  // ====================
  // SAVE
  // ====================
  const handleSave = async () => {
    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
      Alert.alert("Lỗi", "Không tìm thấy mã giảng viên");
      return;
    }

    if (!form.noiDung.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập nội dung");
      return;
    }

    if (selectedNhom.length === 0) {
      Alert.alert("Thông báo", "Vui lòng chọn lớp - môn");
      return;
    }

    try {
      setSaving(true);

      let res;

      if (editMode) {
        res = await editThongBaoGVFull({
          id: getThongBaoId(selectedItem),
          userId: currentUserId,
          noiDung: form.noiDung.trim(),
          maNhom: selectedNhom,
          files: selectedFiles,
          links,
          existingAttachments,
        });

        if (!res.success) {
          Alert.alert("Lỗi", res.message || "Cập nhật thất bại");
          return;
        }

        Alert.alert("Thành công", "Đã cập nhật thông báo");
      } else {
        res = await createThongBaoGVFull({
          userId: currentUserId,
          noiDung: form.noiDung.trim(),
          maNhom: selectedNhom,
          files: selectedFiles,
          links,
        });

        if (!res.success) {
          Alert.alert("Lỗi", res.message || "Tạo thông báo thất bại");
          return;
        }

        Alert.alert("Thành công", "Đã tạo thông báo");
      }

      setModalVisible(false);
      resetForm();
      loadData();
    } catch (err) {
      Alert.alert("Lỗi", err.message || "Không thể lưu thông báo");
    } finally {
      setSaving(false);
    }
  };

  // ====================
  // DELETE
  // ====================
  const handleDelete = (item) => {
    Alert.alert("Xóa thông báo", "Bạn có chắc muốn xóa thông báo này?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          const currentUserId = getCurrentUserId();

          if (!currentUserId) {
            Alert.alert("Lỗi", "Không tìm thấy mã giảng viên");
            return;
          }

          try {
            const res = await deleteThongBaoGV(currentUserId, getThongBaoId(item));

            if (res.success) {
              Alert.alert("Thành công", "Đã xóa");
              loadData();
            } else {
              Alert.alert("Lỗi", res.message || "Xóa thất bại");
            }
          } catch (err) {
            Alert.alert("Lỗi", err.message || "Không thể xóa");
          }
        },
      },
    ]);
  };

  // ====================
  // FORMAT DATE FIX NaN
  // ====================
  const formatDate = (date) => {
    if (!date) return "";

    let d;

    // ASP.NET MVC hay trả kiểu /Date(1712345678900)/
    if (typeof date === "string" && date.includes("/Date(")) {
      const match = date.match(/-?\d+/);

      if (!match) return "";

      d = new Date(parseInt(match[0], 10));
    } else {
      d = new Date(date);
    }

    if (isNaN(d.getTime())) {
      return "";
    }

    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(
      2,
      "0"
    )}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  // ====================
  // ATTACHMENT RENDER
  // ====================
  const renderAttachmentList = (attachments = [], compact = false) => {
    if (!attachments || attachments.length === 0) return null;

    return (
      <View style={compact ? styles.attachCompactBox : styles.attachBox}>
        <Text style={styles.previewLabel}>
          Đính kèm ({attachments.length})
        </Text>

        {attachments.map((att, index) => {
          const url = getFullUrl(att.url);

          if (isImageAttachment(att)) {
            return (
              <TouchableOpacity
                key={`${att.url}-${index}`}
                style={styles.attachmentItem}
                onPress={() => Linking.openURL(url)}
              >
                <Image
                  source={{ uri: url }}
                  style={compact ? styles.attachImageSmall : styles.attachImage}
                />

                <View style={styles.attachmentTextBox}>
                  <Text style={styles.fileName} numberOfLines={2}>
                    🖼 {att.name || "Ảnh đính kèm"}
                  </Text>
                  <Text style={styles.attachHint}>Bấm để xem ảnh</Text>
                </View>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={`${att.url}-${index}`}
              style={styles.fileButton}
              onPress={() => Linking.openURL(url)}
            >
              <Text style={styles.file} numberOfLines={2}>
                {getAttachmentIcon(att)} {att.name || att.url}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderEditableAttachments = () => {
    const hasAny =
      existingAttachments.length > 0 ||
      selectedFiles.length > 0 ||
      links.length > 0;

    if (!hasAny) return null;

    return (
      <View style={styles.previewBox}>
        <Text style={styles.previewLabel}>Đính kèm đã chọn</Text>

        {existingAttachments.map((att, index) => (
          <View key={`old-${att.url}-${index}`} style={styles.selectedRow}>
            {isImageAttachment(att) ? (
              <Image source={{ uri: getFullUrl(att.url) }} style={styles.selectedThumb} />
            ) : (
              <View style={styles.selectedIcon}>
                <Text>{getAttachmentIcon(att)}</Text>
              </View>
            )}

            <Text style={styles.selectedName} numberOfLines={2}>
              {att.name || att.url}
            </Text>

            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => removeExistingAttachment(index)}
            >
              <Text style={styles.removeText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}

        {selectedFiles.map((file, index) => (
          <View key={`file-${file.uri}-${index}`} style={styles.selectedRow}>
            {String(file.type || "").startsWith("image/") ? (
              <Image source={{ uri: file.uri }} style={styles.selectedThumb} />
            ) : (
              <View style={styles.selectedIcon}>
                <Text>📎</Text>
              </View>
            )}

            <Text style={styles.selectedName} numberOfLines={2}>
              {file.name || "File đã chọn"}
            </Text>

            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => removeSelectedFile(index)}
            >
              <Text style={styles.removeText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}

        {links.map((link, index) => (
          <View key={`link-${link.url}-${index}`} style={styles.selectedRow}>
            <View style={styles.selectedIcon}>
              <Text>🔗</Text>
            </View>

            <Text style={styles.selectedName} numberOfLines={2}>
              {link.url}
            </Text>

            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => removeLink(index)}
            >
              <Text style={styles.removeText}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  // ====================
  // RENDER ITEM
  // ====================
  const renderItem = ({ item }) => {
    const id = getThongBaoId(item);
    const groupsOfItem = getItemGroups(item);
    const attachments = getAllAttachments(item);

    let text = stripHtml(getThongBaoContent(item) || "");

    if (text.length > 120) {
      text = text.substring(0, 120) + "...";
    }

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
            <Text style={styles.iconText}>📢</Text>
          </View>

          <View style={styles.cardHeaderText}>
            <Text style={styles.title}>{text || "Thông báo"}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.date}>🕒 {formatDate(item.ThoiGianTao || item.thoiGianTao)}</Text>
        </View>

        {!!groupsOfItem?.length && (
          <View style={styles.groupBox}>
            <Text style={styles.groupLabel}>Lớp - môn</Text>
            <Text style={styles.group}>
              👥 {groupsOfItem.map((n) => n.TenLopMon || n.TenHienThi || getNhomLabel(n)).join(", ")}
            </Text>
          </View>
        )}

        {attachments.length > 0 && renderAttachmentList(attachments, true)}

        <View style={styles.rowBtns}>
          <TouchableOpacity
            style={styles.detailBtn}
            onPress={() => openDetail(id)}
          >
            <Text style={styles.btnText}>Chi tiết</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
            <Text style={styles.btnText}>Sửa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.delBtn}
            onPress={() => handleDelete(item)}
          >
            <Text style={styles.btnText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const detailAttachments = selectedItem ? getAllAttachments(selectedItem) : [];
  const detailText = stripHtml(getThongBaoContent(selectedItem) || "");

  // ====================
  // UI
  // ====================
  return (
    <MainLayout navigation={navigation} title="📢 Thông báo">
      <View style={styles.container}>
        <View style={styles.topBar}>
          <View style={styles.searchWrap}>
            <Text style={styles.searchIcon}>🔎</Text>
            <TextInput
              placeholder="Tìm theo nội dung..."
              placeholderTextColor="#8b95a7"
              value={search}
              onChangeText={handleSearch}
              style={styles.search}
            />
          </View>

          <TouchableOpacity style={styles.addBtn} onPress={openCreate}>
            <Text style={styles.btnText}>+ Tạo</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#2f80ed" />
            <Text style={styles.loadingText}>Đang tải thông báo...</Text>
          </View>
        ) : (
          <FlatList
            data={list}
            keyExtractor={(item) => String(getThongBaoId(item))}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={styles.emptyIcon}>📭</Text>
                <Text style={styles.empty}>Không có thông báo</Text>
              </View>
            }
          />
        )}

        {/* CREATE + EDIT */}
        <Modal visible={modalVisible} animationType="slide">
          <ScrollView contentContainerStyle={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalIcon}>{editMode ? "✏️" : "📝"}</Text>
              <Text style={styles.titleModal}>
                {editMode ? "Sửa thông báo" : "Tạo thông báo"}
              </Text>
            </View>

            <Text style={styles.label}>Chọn lớp - môn:</Text>

            {groups.length === 0 ? (
              <View style={styles.emptyGroupBox}>
                <Text style={styles.emptyGroup}>Không có lớp - môn để chọn</Text>
              </View>
            ) : (
              groups.map((g) => {
                const maNhom = g.MaNhom || g.maNhom;
                const active = selectedNhom.includes(maNhom);

                return (
                  <TouchableOpacity
                    key={maNhom}
                    style={[styles.groupItem, active && styles.groupActive]}
                    onPress={() => toggleGroup(maNhom)}
                  >
                    <Text style={[styles.groupText, active && styles.groupTextActive]}>
                      {active ? "✅ " : "⬜ "}
                      {g.TenLopMon || g.TenHienThi || getNhomLabel(g)}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}

            <Text style={styles.label}>Nội dung:</Text>

            <TextInput
              multiline
              value={form.noiDung}
              onChangeText={(v) =>
                setForm({
                  ...form,
                  noiDung: v,
                })
              }
              style={styles.textarea}
              placeholder="Nhập nội dung thông báo..."
              placeholderTextColor="#9aa3b2"
            />

            <Text style={styles.label}>Công cụ:</Text>

            <View style={styles.tools}>
              <TouchableOpacity style={styles.toolBtnGreen} onPress={handleTakePhoto}>
                <Text style={styles.toolText}>📷 Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.toolBtnBlue} onPress={insertLink}>
                <Text style={styles.toolText}>🔗 Link</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tools}>
              <TouchableOpacity style={styles.toolBtnPurple} onPress={chooseImage}>
                <Text style={styles.toolText}>🖼 Ảnh</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.toolBtnOrange} onPress={chooseFile}>
                <Text style={styles.toolText}>📎 File</Text>
              </TouchableOpacity>
            </View>

            {renderEditableAttachments()}

            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.disabledBtn]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.btnText}>
                  {editMode ? "Lưu thay đổi" : "Tạo thông báo"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => {
                setModalVisible(false);
                resetForm();
              }}
              disabled={saving}
            >
              <Text style={styles.close}>Đóng</Text>
            </TouchableOpacity>
          </ScrollView>
        </Modal>

        {/* DETAIL */}
        <Modal visible={detailVisible} animationType="slide">
          <ScrollView contentContainerStyle={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalIcon}>📄</Text>
              <Text style={styles.titleModal}>Chi tiết thông báo</Text>
            </View>

            <View style={styles.detailContentBox}>
              {detailText ? (
                <Text style={styles.detailText}>{detailText}</Text>
              ) : selectedItem?.NoiDung ? (
                <RenderHTML
                  contentWidth={width - 50}
                  source={{ html: selectedItem.NoiDung }}
                  baseStyle={styles.htmlBase}
                />
              ) : (
                <Text style={styles.empty}>Không có nội dung</Text>
              )}
            </View>

            <View style={styles.detailInfoBox}>
              <Text style={styles.date}>
                🕒 {formatDate(selectedItem?.ThoiGianTao || selectedItem?.thoiGianTao)}
              </Text>

              {!!getItemGroups(selectedItem)?.length && (
                <>
                  <Text style={styles.label}>Lớp - môn:</Text>

                  {getItemGroups(selectedItem).map((n, index) => (
                    <Text key={index} style={styles.groupDetail}>
                      • {n.TenLopMon || n.TenHienThi || getNhomLabel(n)}
                    </Text>
                  ))}
                </>
              )}

              {detailAttachments.length > 0 &&
                renderAttachmentList(detailAttachments, false)}
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => {
                setDetailVisible(false);
                setSelectedItem(null);
              }}
            >
              <Text style={styles.close}>Đóng</Text>
            </TouchableOpacity>
          </ScrollView>
        </Modal>

        {/* LINK MODAL */}
        <Modal visible={linkModalVisible} transparent animationType="fade">
          <View style={styles.linkOverlay}>
            <View style={styles.linkBox}>
              <Text style={styles.linkTitle}>Thêm link</Text>

              <TextInput
                value={linkInput}
                onChangeText={setLinkInput}
                placeholder="Nhập URL..."
                placeholderTextColor="#9aa3b2"
                style={styles.linkInput}
                autoCapitalize="none"
              />

              <View style={styles.linkActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setLinkModalVisible(false)}
                >
                  <Text style={styles.btnText}>Hủy</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.okBtn} onPress={saveLink}>
                  <Text style={styles.btnText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </MainLayout>
  );
}

// ====================
// STYLE
// ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#eef3ff",
  },

  topBar: {
    flexDirection: "row",
    marginBottom: 18,
    alignItems: "center",
  },

  searchWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 18,
    paddingHorizontal: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#dbe5ff",
    elevation: 2,
  },

  searchIcon: {
    fontSize: 18,
    marginRight: 6,
  },

  search: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1f2937",
  },

  addBtn: {
    backgroundColor: "#2f80ed",
    paddingHorizontal: 20,
    paddingVertical: 14,
    justifyContent: "center",
    borderRadius: 18,
    elevation: 3,
  },

  btnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
    textAlign: "center",
  },

  loadingBox: {
    marginTop: 80,
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    color: "#64748b",
    fontWeight: "600",
  },

  card: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 22,
    marginBottom: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#e6edff",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  iconText: {
    fontSize: 22,
  },

  cardHeaderText: {
    flex: 1,
  },

  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    lineHeight: 25,
  },

  metaRow: {
    marginBottom: 10,
  },

  date: {
    color: "#64748b",
    marginBottom: 8,
    fontWeight: "600",
  },

  groupBox: {
    backgroundColor: "#f0f7ff",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#cfe5ff",
  },

  groupLabel: {
    color: "#1d4ed8",
    fontWeight: "800",
    marginBottom: 5,
  },

  group: {
    color: "#2563eb",
    fontWeight: "700",
    lineHeight: 22,
  },

  fileButton: {
    backgroundColor: "#fef3c7",
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
  },

  file: {
    color: "#b45309",
    fontWeight: "800",
  },

  rowBtns: {
    flexDirection: "row",
    marginTop: 8,
  },

  detailBtn: {
    flex: 1,
    backgroundColor: "#2f80ed",
    padding: 12,
    borderRadius: 14,
    marginRight: 7,
    alignItems: "center",
  },

  editBtn: {
    flex: 1,
    backgroundColor: "#f59e0b",
    padding: 12,
    borderRadius: 14,
    marginRight: 7,
    alignItems: "center",
  },

  delBtn: {
    flex: 1,
    backgroundColor: "#ef4444",
    padding: 12,
    borderRadius: 14,
    alignItems: "center",
  },

  modal: {
    padding: 25,
    backgroundColor: "#f8fbff",
    minHeight: "100%",
  },

  modalHeader: {
    alignItems: "center",
    marginBottom: 22,
  },

  modalIcon: {
    fontSize: 36,
    marginBottom: 8,
  },

  titleModal: {
    fontSize: 27,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
  },

  label: {
    fontWeight: "900",
    color: "#1f2937",
    marginBottom: 9,
    marginTop: 12,
    fontSize: 16,
  },

  groupItem: {
    padding: 14,
    borderWidth: 1,
    borderColor: "#d9e4ff",
    borderRadius: 15,
    marginBottom: 10,
    backgroundColor: "white",
  },

  groupActive: {
    backgroundColor: "#dbeafe",
    borderColor: "#2f80ed",
  },

  groupText: {
    fontWeight: "700",
    color: "#334155",
  },

  groupTextActive: {
    color: "#1d4ed8",
  },

  emptyGroupBox: {
    backgroundColor: "#fff7ed",
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#fed7aa",
  },

  emptyGroup: {
    color: "#c2410c",
    fontWeight: "700",
    fontStyle: "italic",
  },

  textarea: {
    borderWidth: 1,
    borderColor: "#d9e4ff",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 14,
    minHeight: 165,
    textAlignVertical: "top",
    marginBottom: 15,
    fontSize: 16,
    color: "#111827",
  },

  tools: {
    flexDirection: "row",
    marginBottom: 10,
    gap: 9,
  },

  toolBtnGreen: {
    flex: 1,
    backgroundColor: "#dcfce7",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 13,
    alignItems: "center",
  },

  toolBtnBlue: {
    flex: 1,
    backgroundColor: "#dbeafe",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 13,
    alignItems: "center",
  },

  toolBtnPurple: {
    flex: 1,
    backgroundColor: "#ede9fe",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 13,
    alignItems: "center",
  },

  toolBtnOrange: {
    flex: 1,
    backgroundColor: "#ffedd5",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 13,
    alignItems: "center",
  },

  toolText: {
    fontWeight: "800",
    color: "#1f2937",
  },

  previewBox: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5edff",
  },

  previewLabel: {
    fontWeight: "800",
    color: "#475569",
    marginBottom: 8,
  },

  fileName: {
    color: "#2563eb",
    fontWeight: "800",
    lineHeight: 22,
  },

  selectedRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 9,
    marginBottom: 8,
  },

  selectedThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: "#e5e7eb",
  },

  selectedIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  selectedName: {
    flex: 1,
    color: "#334155",
    fontWeight: "700",
    lineHeight: 20,
  },

  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  removeText: {
    color: "white",
    fontWeight: "900",
    fontSize: 16,
  },

  attachCompactBox: {
    backgroundColor: "#fff",
    marginBottom: 8,
  },

  attachBox: {
    marginTop: 12,
  },

  attachmentItem: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 9,
    marginBottom: 8,
  },

  attachmentTextBox: {
    flex: 1,
    justifyContent: "center",
  },

  attachImage: {
    width: 120,
    height: 90,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: "#e5e7eb",
  },

  attachImageSmall: {
    width: 76,
    height: 58,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: "#e5e7eb",
  },

  attachHint: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
  },

  saveBtn: {
    backgroundColor: "#16a34a",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 12,
    elevation: 3,
  },

  disabledBtn: {
    opacity: 0.65,
  },

  closeBtn: {
    paddingVertical: 14,
  },

  close: {
    textAlign: "center",
    color: "#dc2626",
    marginTop: 12,
    fontSize: 17,
    fontWeight: "800",
  },

  emptyBox: {
    marginTop: 120,
    alignItems: "center",
  },

  emptyIcon: {
    fontSize: 45,
    marginBottom: 8,
  },

  empty: {
    textAlign: "center",
    color: "#64748b",
    fontWeight: "700",
  },

  detailContentBox: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e5edff",
    marginBottom: 15,
  },

  detailText: {
    color: "#111827",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
  },

  detailInfoBox: {
    backgroundColor: "#f0f7ff",
    padding: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#cfe5ff",
  },

  htmlBase: {
    color: "#111827",
    fontSize: 16,
    lineHeight: 24,
  },

  groupDetail: {
    marginBottom: 8,
    color: "#2563eb",
    fontWeight: "700",
  },

  linkOverlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.55)",
    justifyContent: "center",
    padding: 25,
  },

  linkBox: {
    backgroundColor: "white",
    padding: 22,
    borderRadius: 18,
  },

  linkTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 15,
    textAlign: "center",
  },

  linkInput: {
    borderWidth: 1,
    borderColor: "#d9e4ff",
    borderRadius: 13,
    padding: 13,
    marginBottom: 15,
    fontSize: 16,
    color: "#111827",
  },

  linkActions: {
    flexDirection: "row",
  },

  cancelBtn: {
    flex: 1,
    backgroundColor: "#94a3b8",
    padding: 13,
    borderRadius: 13,
    alignItems: "center",
    marginRight: 8,
  },

  okBtn: {
    flex: 1,
    backgroundColor: "#2f80ed",
    padding: 13,
    borderRadius: 13,
    alignItems: "center",
  },
});

