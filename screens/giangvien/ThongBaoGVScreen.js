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

import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import RenderHTML from "react-native-render-html";

import MainLayout from "../../components/MainLayout";
import { AuthContext } from "../../context/AuthContext";
import { API_URL } from "../../api/config";

import {
  getThongBaoGV,
  createThongBaoGV,
  updateThongBaoGV,
  deleteThongBaoGV,
  getThongBaoGVDetail,
  getNhomGV,
  uploadThongBaoImage,
} from "../../api/thongbaogv";

const API_ROOT = API_URL.replace(/\/$/, "");

const getFullUrl = (url) => {
  if (!url) return "";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${API_ROOT}${url}`;
};

export default function ThongBaoGVScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const { width } = useWindowDimensions();

  const [list, setList] = useState([]);
  const [groups, setGroups] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [form, setForm] = useState({
    noiDung: "",
  });

  const [selectedNhom, setSelectedNhom] = useState([]);

  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");

  const [linkModalVisible, setLinkModalVisible] = useState(false);
  const [linkInput, setLinkInput] = useState("");

  // ====================
  // LẤY MÃ GIẢNG VIÊN / USER ID
  // ====================
  const getCurrentUserId = () => {
    console.log("AUTH USER FULL:", JSON.stringify(user, null, 2));

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

    console.log("API_URL:", API_URL);
    console.log("CURRENT USER ID GUI LEN API:", currentUserId);

    // Khi đăng xuất, user bị xóa.
    // Không hiện Alert lỗi nữa, chỉ reset dữ liệu.
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

      console.log("THONG BAO DATA:", tbData);
      console.log("NHOM DATA:", nhomData);

      if (tbData.success) {
        setList(tbData.data || []);
      } else {
        Alert.alert("Lỗi", tbData.message || "Không lấy được thông báo");
      }

      if (nhomData.success) {
        setGroups(nhomData.data || []);
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
        setList(res.data || []);
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

    setImageUrl("");
    setLinkUrl("");

    setFileUrl("");
    setFileName("");

    setLinkInput("");
    setSelectedItem(null);
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
    setSelectedItem(item);

    setForm({
      noiDung: stripHtml(item.NoiDung || ""),
    });

    setSelectedNhom(item.Nhom ? item.Nhom.map((n) => n.MaNhom) : []);

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
      const res = await getThongBaoGVDetail(id, currentUserId);

      if (res.success) {
        setSelectedItem(res.data);
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
  // INSERT LINK
  // ====================
  const insertLink = () => {
    setLinkInput(linkUrl || "");
    setLinkModalVisible(true);
  };

  const saveLink = () => {
    if (!linkInput.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập link");
      return;
    }

    setLinkUrl(linkInput.trim());
    setLinkModalVisible(false);
  };

  // ====================
  // CHOOSE IMAGE
  // ====================
  const chooseImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Thông báo", "Bạn chưa cấp quyền thư viện ảnh");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (result.canceled) return;

      const image = result.assets[0];

      const res = await uploadThongBaoImage({
        uri: image.uri,
        type: image.mimeType || "image/jpeg",
        name: image.fileName || "image.jpg",
      });

      if (res.success) {
        setImageUrl(getFullUrl(res.url));
      } else {
        Alert.alert("Lỗi", res.message || "Upload ảnh thất bại");
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Lỗi", err.message || "Không thể chọn ảnh");
    }
  };

  // ====================
  // CHOOSE FILE
  // ====================
  const chooseFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];

      const res = await uploadThongBaoImage({
        uri: file.uri,
        type: file.mimeType || "application/octet-stream",
        name: file.name || "file_upload",
      });

      if (res.success) {
        setFileUrl(getFullUrl(res.url));
        setFileName(file.name || "file_upload");
      } else {
        Alert.alert("Lỗi", res.message || "Upload file thất bại");
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Lỗi", err.message || "Không thể chọn file");
    }
  };

  // ====================
  // BUILD CONTENT
  // ====================
  const buildContent = () => {
    let finalContent = form.noiDung || "";

    if (linkUrl) {
      finalContent += `
        <br/>
        <a href="${linkUrl}" target="_blank">
          ${linkUrl}
        </a>
      `;
    }

    if (imageUrl) {
      finalContent += `
        <br/>
        <img src="${imageUrl}" style="max-width:300px"/>
      `;
    }

    if (fileUrl) {
      finalContent += `
        <br/>
        <a href="${fileUrl}" target="_blank">
          📎 ${fileName}
        </a>
      `;
    }

    return finalContent;
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
      const finalContent = buildContent();

      let res;

      if (editMode) {
        res = await updateThongBaoGV(selectedItem.MaThongBao, {
          userId: currentUserId,
          noiDung: finalContent,
          maNhom: selectedNhom,
        });

        if (!res.success) {
          Alert.alert("Lỗi", res.message || "Cập nhật thất bại");
          return;
        }

        Alert.alert("Thành công", "Đã cập nhật thông báo");
      } else {
        res = await createThongBaoGV({
          userId: currentUserId,
          noiDung: finalContent,
          maNhom: selectedNhom,
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
            const res = await deleteThongBaoGV(item.MaThongBao, currentUserId);

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
  // REMOVE HTML
  // ====================
  const stripHtml = (html = "") => {
    return html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]*>?/gm, "")
      .replace(/&nbsp;/g, " ")
      .trim();
  };

  // ====================
  // RENDER ITEM
  // ====================
  const renderItem = ({ item }) => {
    let text = stripHtml(item.NoiDung || "");

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
          <Text style={styles.date}>🕒 {formatDate(item.ThoiGianTao)}</Text>
        </View>

        {!!item.Nhom?.length && (
          <View style={styles.groupBox}>
            <Text style={styles.groupLabel}>Lớp - môn</Text>
            <Text style={styles.group}>
              👥{" "}
              {item.Nhom.map((n) =>
                n.TenLopMon || `${n.TenNhom} - ${n.TenMonHoc}`
              ).join(", ")}
            </Text>
          </View>
        )}

        {!!item.FileDinhKem && (
          <TouchableOpacity
            style={styles.fileButton}
            onPress={() => Linking.openURL(getFullUrl(item.FileDinhKem))}
          >
            <Text style={styles.file}>📎 Xem / tải file đính kèm</Text>
          </TouchableOpacity>
        )}

        <View style={styles.rowBtns}>
          <TouchableOpacity
            style={styles.detailBtn}
            onPress={() => openDetail(item.MaThongBao)}
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
            keyExtractor={(item) => item.MaThongBao.toString()}
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
                const active = selectedNhom.includes(g.MaNhom);

                return (
                  <TouchableOpacity
                    key={g.MaNhom}
                    style={[styles.groupItem, active && styles.groupActive]}
                    onPress={() => toggleGroup(g.MaNhom)}
                  >
                    <Text style={[styles.groupText, active && styles.groupTextActive]}>
                      {active ? "✅ " : "⬜ "}
                      {g.TenLopMon || `${g.TenNhom} - ${g.TenMonHoc}`}
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
              <TouchableOpacity style={styles.toolBtnBlue} onPress={insertLink}>
                <Text style={styles.toolText}>🔗 Link</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.toolBtnPurple} onPress={chooseImage}>
                <Text style={styles.toolText}>🖼 Ảnh</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.toolBtnOrange} onPress={chooseFile}>
                <Text style={styles.toolText}>📎 File</Text>
              </TouchableOpacity>
            </View>

            {!!linkUrl && (
              <View style={styles.previewBox}>
                <Text style={styles.previewLabel}>Link đã thêm</Text>
                <Text style={styles.fileName}>🔗 {linkUrl}</Text>
              </View>
            )}

            {!!imageUrl && (
              <View style={styles.previewBox}>
                <Text style={styles.previewLabel}>Ảnh đã thêm</Text>
                <Image source={{ uri: imageUrl }} style={styles.preview} />
              </View>
            )}

            {!!fileName && (
              <View style={styles.previewBox}>
                <Text style={styles.previewLabel}>File đã thêm</Text>
                <Text style={styles.fileName}>📎 {fileName}</Text>
              </View>
            )}

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.btnText}>
                {editMode ? "Lưu thay đổi" : "Tạo thông báo"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => {
                setModalVisible(false);
                resetForm();
              }}
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
              {!!selectedItem?.NoiDung && (
                <RenderHTML
                  contentWidth={width - 50}
                  source={{
                    html: selectedItem.NoiDung,
                  }}
                  baseStyle={styles.htmlBase}
                />
              )}
            </View>

            <View style={styles.detailInfoBox}>
              <Text style={styles.date}>
                🕒 {formatDate(selectedItem?.ThoiGianTao)}
              </Text>

              {!!selectedItem?.Nhoms?.length && (
                <>
                  <Text style={styles.label}>Lớp - môn:</Text>

                  {selectedItem.Nhoms.map((n, index) => (
                    <Text key={index} style={styles.groupDetail}>
                      • {n.TenLopMon || `${n.TenNhom} - ${n.TenMonHoc}`}
                    </Text>
                  ))}
                </>
              )}

              {!!selectedItem?.FileDinhKem && (
                <TouchableOpacity
                  style={styles.fileButton}
                  onPress={() =>
                    Linking.openURL(getFullUrl(selectedItem.FileDinhKem))
                  }
                >
                  <Text style={styles.file}>📎 Xem / tải file đính kèm</Text>
                </TouchableOpacity>
              )}
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
    marginBottom: 12,
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
    marginBottom: 15,
  },

  toolBtnBlue: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 13,
    marginRight: 9,
  },

  toolBtnPurple: {
    backgroundColor: "#ede9fe",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 13,
    marginRight: 9,
  },

  toolBtnOrange: {
    backgroundColor: "#ffedd5",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 13,
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

  preview: {
    width: "100%",
    height: 220,
    borderRadius: 14,
  },

  fileName: {
    color: "#2563eb",
    fontWeight: "800",
    lineHeight: 22,
  },

  saveBtn: {
    backgroundColor: "#16a34a",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 12,
    elevation: 3,
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