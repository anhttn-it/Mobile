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
  Linking,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from "expo-document-picker";

import MainLayout from "../../components/MainLayout";
import { AuthContext } from "../../context/AuthContext";
import { API_URL } from "../../api/config";

import {
  getNguoiDung,
  getNhomNguoiDung,
  getNguoiDungEdit,
  createNguoiDung,
  editNguoiDung,
  deleteNguoiDung,
  importNguoiDung,
} from "../../api/nguoidung";

export default function SinhVienScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  const [students, setStudents] = useState([]);
  const [groups, setGroups] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [editingLoading, setEditingLoading] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [nhomFilter, setNhomFilter] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [activeTab, setActiveTab] = useState("manual");

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleteMaNhoms, setDeleteMaNhoms] = useState([]);

  const [showDate, setShowDate] = useState(false);
  const [errors, setErrors] = useState({});

  const emptyForm = {
    id: "",
    email: "",
    hoTen: "",
    gioiTinh: "Nam",
    ngaySinh: "",
    trangThai: true,
    maNhoms: [],
  };

  const [form, setForm] = useState(emptyForm);

  // =============================
  // HELPER
  // =============================

  const getCurrentUserId = () => {
    return user?.userId || user?.UserId || user?.id || user?.Id || "";
  };

  const pad = (n) => String(n).padStart(2, "0");

  const formatDateInput = (date) => {
    if (!date) return "";

    const d = new Date(date);

    if (isNaN(d.getTime())) return "";

    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  const formatDateDisplay = (date) => {
    if (!date) return "";

    const d = new Date(date);

    if (isNaN(d.getTime())) return date;

    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  };

  const formatDateTimeDisplay = (date) => {
    if (!date) return "";

    const d = new Date(date);

    if (isNaN(d.getTime())) return date;

    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(
      d.getHours()
    )}:${pad(d.getMinutes())}`;
  };

  const isActiveStatus = (value) => {
    return value === true || value === "true" || value === 1 || value === "1";
  };

  const getError = (key) => {
    if (!errors) return "";

    const lowerKey = key.charAt(0).toLowerCase() + key.slice(1);

    return errors[key] || errors[lowerKey] || "";
  };

  const isFail = (res) => {
    return res?.success === false || res?.Success === false;
  };

  const getMessage = (res, fallback = "Có lỗi xảy ra") => {
    return res?.message || res?.Message || fallback;
  };

  const getGroupLabel = (g) => {
    if (!g) return "";

    const tenNhom = g.TenNhom || g.tenNhom || "Chưa có nhóm";

    const tenMon =
      g.TenMon ||
      g.tenMon ||
      g.TenMonHoc ||
      g.tenMonHoc ||
      g.MonHoc ||
      g.monHoc ||
      "Chưa có môn";

    return `${tenNhom} - ${tenMon}`;
  };

  const getItemGroups = (item) => {
    return item?.Nhoms || item?.nhoms || item?.Nhom || item?.nhom || [];
  };

  const getInitial = (name) => {
    if (!name || !name.trim()) return "?";

    return name.trim().charAt(0).toUpperCase();
  };

  const toggleArrayValue = (arr, value) => {
    const numberValue = Number(value);

    if (arr.includes(numberValue)) {
      return arr.filter((x) => x !== numberValue);
    }

    return [...arr, numberValue];
  };

  const clearErrors = () => {
    setErrors({});
  };

  // =============================
  // LOAD DATA
  // =============================

  const loadData = async (options = {}) => {
    const currentUserId = getCurrentUserId();

    if (!currentUserId) return;

    const nextPage = options.page ?? page;
    const nextSearch = options.search ?? search;
    const nextNhomFilter = options.nhomFilter ?? nhomFilter;
    const showLoading = options.showLoading ?? true;

    try {
      if (showLoading) {
        setLoading(true);
      }

      const [svData, nhomData] = await Promise.all([
        getNguoiDung(currentUserId, nextSearch, nextNhomFilter, nextPage),
        getNhomNguoiDung(currentUserId),
      ]);

      if (isFail(svData)) {
        Alert.alert("Thông báo", getMessage(svData));
        return;
      }

      if (isFail(nhomData)) {
        Alert.alert("Thông báo", getMessage(nhomData));
        return;
      }

      const list = svData?.data || svData?.Data || [];
      const pagination = svData?.pagination || svData?.Pagination || {};

      const groupList =
        nhomData?.data ||
        nhomData?.Data ||
        nhomData?.nhom ||
        nhomData?.Nhom ||
        [];

      setStudents(Array.isArray(list) ? list : []);
      setGroups(Array.isArray(groupList) ? groupList : []);

      setTotalPages(
        pagination?.totalPages ||
          pagination?.TotalPages ||
          svData?.totalPages ||
          svData?.TotalPages ||
          1
      );
    } catch (err) {
      Alert.alert("Lỗi", err.message);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, [user, page, search, nhomFilter]);

  // =============================
  // SEARCH / FILTER / REFRESH
  // =============================

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData({ showLoading: false });
    setRefreshing(false);
  };

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const clearFilter = () => {
    setSearchInput("");
    setSearch("");
    setNhomFilter(null);
    setPage(1);
  };

  const handleChangeNhomFilter = (maNhom) => {
    setNhomFilter(maNhom);
    setPage(1);
  };

  // =============================
  // CREATE / EDIT MODAL
  // =============================

  const openCreate = () => {
    setForm(emptyForm);
    clearErrors();
    setActiveTab("manual");
    setModalMode("create");
    setModalVisible(true);
  };

  const openEdit = async (item) => {
    const currentUserId = getCurrentUserId();

    if (!currentUserId || !item?.Id) return;

    try {
      setEditingLoading(true);
      clearErrors();

      const res = await getNguoiDungEdit(currentUserId, item.Id);

      if (isFail(res)) {
        Alert.alert("Thông báo", getMessage(res));
        return;
      }

      const data = res?.data || res?.Data || item;

      const nhomDaChon =
        res?.nhomDaChon ||
        res?.NhomDaChon ||
        getItemGroups(data).map((x) => Number(x.MaNhom || x.maNhom));

      setForm({
        id: data.Id || data.id || item.Id,
        email: data.Email || data.email || item.Email || "",
        hoTen: data.HoTen || data.hoTen || item.HoTen || "",
        gioiTinh: data.GioiTinh || data.gioiTinh || "Nam",
        ngaySinh: formatDateInput(data.NgaySinh || data.ngaySinh),
        trangThai: isActiveStatus(data.TrangThai ?? data.trangThai),
        maNhoms: Array.isArray(nhomDaChon)
          ? nhomDaChon.map((x) => Number(x))
          : [],
      });

      setActiveTab("manual");
      setModalMode("edit");
      setModalVisible(true);
    } catch (err) {
      Alert.alert("Lỗi", err.message);
    } finally {
      setEditingLoading(false);
    }
  };

  const closeMainModal = () => {
    setModalVisible(false);
    setShowDate(false);
    clearErrors();
  };

  // =============================
  // VALIDATE / SAVE
  // =============================

  const validateClient = () => {
    const newErrors = {};

    if (!form.hoTen || !form.hoTen.trim()) {
      newErrors.HoTen = "Vui lòng nhập họ tên sinh viên";
    }

    if (modalMode === "create") {
      if (!form.email || !form.email.trim()) {
        newErrors.Email = "Vui lòng nhập email sinh viên";
      }
    }

    if (!form.maNhoms || form.maNhoms.length === 0) {
      newErrors.MaNhoms = "Vui lòng chọn ít nhất một nhóm-môn";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
      Alert.alert("Lỗi", "Không tìm thấy thông tin giảng viên đang đăng nhập");
      return;
    }

    clearErrors();

    if (!validateClient()) {
      return;
    }

    try {
      setSaving(true);

      let res;

      if (modalMode === "edit") {
        res = await editNguoiDung({
          userId: currentUserId,
          id: form.id,
          hoTen: form.hoTen,
          gioiTinh: form.gioiTinh,
          ngaySinh: form.ngaySinh || null,
          trangThai: form.trangThai,
          maNhoms: form.maNhoms,
        });
      } else {
        res = await createNguoiDung({
          userId: currentUserId,
          hoTen: form.hoTen,
          email: form.email,
          gioiTinh: form.gioiTinh,
          ngaySinh: form.ngaySinh || null,
          trangThai: form.trangThai,
          maNhoms: form.maNhoms,
        });
      }

      if (isFail(res)) {
        const apiErrors = res?.errors || res?.Errors || {};

        setErrors(apiErrors);

        Alert.alert(
          "Thông báo",
          getMessage(res, "Dữ liệu chưa hợp lệ, vui lòng kiểm tra lại")
        );

        return;
      }

      Alert.alert(
        "Thành công",
        modalMode === "edit"
          ? "Cập nhật sinh viên thành công!"
          : "Thêm sinh viên vào lớp thành công!"
      );

      closeMainModal();
      await loadData();
    } catch (err) {
      Alert.alert("Lỗi", err.message);
    } finally {
      setSaving(false);
    }
  };

  // =============================
  // IMPORT / EXPORT
  // =============================

  const handleImportCsv = async () => {
    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
      Alert.alert("Lỗi", "Không tìm thấy thông tin giảng viên đang đăng nhập");
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "text/csv",
          "text/comma-separated-values",
          "application/vnd.ms-excel",
          "*/*",
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];

      if (!asset) return;

      const file = {
        uri: asset.uri,
        name: asset.name || "students.csv",
        type: asset.mimeType || "text/csv",
      };

      setSaving(true);

      const res = await importNguoiDung(currentUserId, file);

      if (isFail(res)) {
        Alert.alert("Import thất bại", getMessage(res));
        return;
      }

      const added = res?.added ?? res?.Added ?? 0;
      const updated = res?.updated ?? res?.Updated ?? 0;
      const skipped = res?.skipped ?? res?.Skipped ?? 0;
      const logs = res?.logs || res?.Logs || [];

      Alert.alert(
        "Import thành công",
        `Updated: ${updated}\nAdded: ${added}\nSkipped: ${skipped}${
          logs.length ? "\n\n" + logs.slice(0, 5).join("\n") : ""
        }`
      );

      closeMainModal();
      await loadData();
    } catch (err) {
      Alert.alert("Lỗi import", err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleExportAll = async () => {
    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
      Alert.alert("Lỗi", "Không tìm thấy thông tin giảng viên đang đăng nhập");
      return;
    }

    const url = `${API_URL}/api/NguoiDungApi/Export?userId=${encodeURIComponent(
      currentUserId
    )}`;

    Linking.openURL(url);
  };

  const handleExportByClass = async () => {
    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
      Alert.alert("Lỗi", "Không tìm thấy thông tin giảng viên đang đăng nhập");
      return;
    }

    if (!nhomFilter) {
      Alert.alert("Thông báo", "Vui lòng chọn nhóm-môn cần export");
      return;
    }

    const url = `${API_URL}/api/NguoiDungApi/Export?userId=${encodeURIComponent(
      currentUserId
    )}&nhomId=${encodeURIComponent(nhomFilter)}`;

    Linking.openURL(url);
  };

  // =============================
  // DELETE
  // =============================

  const openDelete = (item) => {
    const itemGroups = getItemGroups(item);

    const defaultSelected =
      itemGroups.length > 0
        ? [Number(itemGroups[0].MaNhom || itemGroups[0].maNhom)]
        : [];

    setDeleteItem(item);
    setDeleteMaNhoms(defaultSelected);
    setDeleteModalVisible(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalVisible(false);
    setDeleteItem(null);
    setDeleteMaNhoms([]);
  };

  const handleDelete = async () => {
    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
      Alert.alert("Lỗi", "Không tìm thấy thông tin giảng viên đang đăng nhập");
      return;
    }

    if (!deleteItem?.Id) {
      Alert.alert("Lỗi", "Thiếu ID sinh viên");
      return;
    }

    if (!deleteMaNhoms || deleteMaNhoms.length === 0) {
      Alert.alert("Thông báo", "Vui lòng chọn nhóm-môn cần xóa");
      return;
    }

    Alert.alert("Xác nhận", "Bạn chắc chắn muốn xóa sinh viên khỏi nhóm-môn đã chọn?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            setSaving(true);

            const res = await deleteNguoiDung(
              currentUserId,
              deleteItem.Id,
              deleteMaNhoms
            );

            if (isFail(res)) {
              Alert.alert("Thông báo", getMessage(res));
              return;
            }

            Alert.alert("Thành công", "Xóa khỏi lớp-môn thành công!");
            closeDeleteModal();
            await loadData();
          } catch (err) {
            Alert.alert("Lỗi", err.message);
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  };

  // =============================
  // RENDER COMPONENTS
  // =============================

  const renderGroupBadge = (g) => {
    const id = g.MaNhom || g.maNhom;

    return (
      <View key={id} style={styles.classBadge}>
        <Text style={styles.classBadgeText}>{getGroupLabel(g)}</Text>
      </View>
    );
  };

  const renderItem = ({ item }) => {
    const itemGroups = getItemGroups(item);
    const active = isActiveStatus(item.TrangThai ?? item.trangThai);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.infoLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitial(item.HoTen)}</Text>
            </View>

            <View style={styles.infoTextBox}>
              <Text style={styles.name}>{item.HoTen}</Text>
              <Text style={styles.email}>{item.Email}</Text>
            </View>
          </View>

          <View style={[styles.statusPill, active ? styles.statusOnBg : styles.statusOffBg]}>
            <Text style={[styles.statusText, active ? styles.statusOn : styles.statusOff]}>
              ● {active ? "Hoạt động" : "Khóa"}
            </Text>
          </View>
        </View>

        <View style={styles.rowInfo}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Giới tính</Text>
            <Text style={styles.infoValue}>{item.GioiTinh || ""}</Text>
          </View>

          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Ngày sinh</Text>
            <Text style={styles.infoValue}>{formatDateDisplay(item.NgaySinh)}</Text>
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.infoLabel}>Nhóm-môn</Text>

          {itemGroups && itemGroups.length > 0 ? (
            <View style={styles.badgeWrap}>{itemGroups.map(renderGroupBadge)}</View>
          ) : (
            <Text style={styles.emptyClass}>Chưa có nhóm-môn</Text>
          )}
        </View>

        <View style={styles.rowInfo}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Ngày tham gia</Text>
            <Text style={styles.infoValue}>
              {formatDateTimeDisplay(item.NgayThamGia)}
            </Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
            <Text style={styles.actionText}>✏️ Sửa</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteBtn} onPress={() => openDelete(item)}>
            <Text style={styles.actionText}>❌ Xóa khỏi nhóm-môn</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFilterGroup = (g) => {
    const id = Number(g.MaNhom || g.maNhom);
    const active = Number(nhomFilter) === id;

    return (
      <TouchableOpacity
        key={id}
        style={[styles.filterChip, active && styles.filterChipActive]}
        onPress={() => handleChangeNhomFilter(active ? null : id)}
      >
        <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
          {getGroupLabel(g)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderGroupCheckbox = (g) => {
    const id = Number(g.MaNhom || g.maNhom);
    const checked = form.maNhoms.includes(id);

    return (
      <TouchableOpacity
        key={id}
        style={[styles.classItem, checked && styles.classItemActive]}
        onPress={() =>
          setForm({
            ...form,
            maNhoms: toggleArrayValue(form.maNhoms, id),
          })
        }
      >
        <Text style={styles.checkbox}>{checked ? "☑" : "☐"}</Text>
        <Text style={styles.classItemText}>{getGroupLabel(g)}</Text>
      </TouchableOpacity>
    );
  };

  const renderDeleteGroupCheckbox = (g) => {
    const id = Number(g.MaNhom || g.maNhom);
    const checked = deleteMaNhoms.includes(id);

    return (
      <TouchableOpacity
        key={id}
        style={[styles.classItem, checked && styles.classItemDanger]}
        onPress={() => setDeleteMaNhoms(toggleArrayValue(deleteMaNhoms, id))}
      >
        <Text style={styles.checkbox}>{checked ? "☑" : "☐"}</Text>
        <Text style={styles.classItemText}>{getGroupLabel(g)}</Text>
      </TouchableOpacity>
    );
  };

  const hasFilter = Boolean(search || nhomFilter);

  return (
    <MainLayout navigation={navigation} title="👨‍🎓 Quản lý sinh viên">
      <View style={styles.container}>
        <View style={styles.cardBox}>
         <View style={styles.titleRow}>
            <View>
              <Text style={styles.title}>👨‍🎓 Danh sách sinh viên</Text>
              <Text style={styles.subTitle}>Quản lý sinh viên theo nhóm-môn</Text>
            </View>
          </View>

          <View style={styles.actionGroup}>
            <TouchableOpacity style={[styles.actionBtn, styles.addBtn]} onPress={openCreate}>
              <Text style={styles.whiteBtnText}>+ Thêm</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, styles.importBtn]} onPress={handleImportCsv}>
              <Text style={styles.whiteBtnText}>📥 Import CSV</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, styles.exportAllBtn]} onPress={handleExportAll}>
              <Text style={styles.whiteBtnText}>📤 Export tất cả</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionBtn, styles.exportClassBtn]} onPress={handleExportByClass}>
              <Text style={styles.whiteBtnText}>📤 Theo nhóm</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchRow}>
            <TextInput
              placeholder="🔍 Tìm tên hoặc email..."
              value={searchInput}
              onChangeText={setSearchInput}
              style={styles.searchInput}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />

            <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
              <Text style={styles.whiteBtnText}>Tìm</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            <TouchableOpacity
              style={[styles.filterChip, !nhomFilter && styles.filterChipActive]}
              onPress={() => handleChangeNhomFilter(null)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  !nhomFilter && styles.filterChipTextActive,
                ]}
              >
                Tất cả nhóm-môn
              </Text>
            </TouchableOpacity>

            {groups.map(renderFilterGroup)}
          </ScrollView>

          {hasFilter && (
            <TouchableOpacity style={styles.clearFilterBtn} onPress={clearFilter}>
              <Text style={styles.clearFilterText}>↩ Xóa bộ lọc</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        ) : (
          <FlatList
            data={students}
            keyExtractor={(item, index) => String(item.Id || item.id || index)}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>Không có sinh viên nào</Text>
              </View>
            }
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}

        <View style={styles.pagination}>
          <TouchableOpacity
            style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
            disabled={page <= 1}
            onPress={() => setPage((p) => Math.max(1, p - 1))}
          >
            <Text style={styles.pageBtnText}>◀ Prev</Text>
          </TouchableOpacity>

          <Text style={styles.pageText}>
            {page}/{totalPages}
          </Text>

          <TouchableOpacity
            style={[styles.pageBtn, page >= totalPages && styles.pageBtnDisabled]}
            disabled={page >= totalPages}
            onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            <Text style={styles.pageBtnText}>Next ▶</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={modalVisible} animationType="slide" transparent>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalOverlay}
          >
            <View style={styles.modalBox}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>
                  {modalMode === "edit" ? "Sửa sinh viên" : "Thêm sinh viên vào lớp"}
                </Text>

                {modalMode === "create" && (
                  <View style={styles.tabRow}>
                    <TouchableOpacity
                      style={[
                        styles.tabBtn,
                        activeTab === "manual" && styles.tabBtnActive,
                      ]}
                      onPress={() => setActiveTab("manual")}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          activeTab === "manual" && styles.tabTextActive,
                        ]}
                      >
                        📝 Thêm thủ công
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.tabBtn,
                        activeTab === "excel" && styles.tabBtnActive,
                      ]}
                      onPress={() => setActiveTab("excel")}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          activeTab === "excel" && styles.tabTextActive,
                        ]}
                      >
                        📥 Import file
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {modalMode === "create" && activeTab === "excel" ? (
                  <View>
                    <Text style={styles.smallNote}>
                      CSV: Email, HoTen, GioiTinh, NgaySinh, TrangThai, MaNhom
                    </Text>

                    <TouchableOpacity
                      style={styles.importLargeBtn}
                      onPress={handleImportCsv}
                      disabled={saving}
                    >
                      <Text style={styles.whiteBtnText}>
                        {saving ? "Đang import..." : "Chọn file CSV và Import"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View>
                    <Text style={styles.label}>Họ tên</Text>
                    <TextInput
                      placeholder="Họ tên sinh viên"
                      value={form.hoTen}
                      onChangeText={(v) => setForm({ ...form, hoTen: v })}
                      style={styles.input}
                    />
                    <Text style={styles.fieldError}>{getError("HoTen")}</Text>

                    <Text style={styles.label}>Email</Text>
                    <TextInput
                      placeholder="Email sinh viên đã tồn tại trong hệ thống"
                      value={form.email}
                      editable={modalMode !== "edit"}
                      onChangeText={(v) => setForm({ ...form, email: v })}
                      style={[
                        styles.input,
                        modalMode === "edit" && styles.readonlyInput,
                      ]}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    <Text style={styles.fieldError}>{getError("Email")}</Text>

                    <Text style={styles.label}>Giới tính</Text>
                    <View style={styles.selectRow}>
                      <TouchableOpacity
                        style={[
                          styles.selectOption,
                          form.gioiTinh === "Nam" && styles.selectOptionActive,
                        ]}
                        onPress={() => setForm({ ...form, gioiTinh: "Nam" })}
                      >
                        <Text
                          style={[
                            styles.selectText,
                            form.gioiTinh === "Nam" && styles.selectTextActive,
                          ]}
                        >
                          Nam
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.selectOption,
                          form.gioiTinh === "Nữ" && styles.selectOptionActive,
                        ]}
                        onPress={() => setForm({ ...form, gioiTinh: "Nữ" })}
                      >
                        <Text
                          style={[
                            styles.selectText,
                            form.gioiTinh === "Nữ" && styles.selectTextActive,
                          ]}
                        >
                          Nữ
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>Ngày sinh</Text>
                    <TouchableOpacity
                      style={styles.input}
                      onPress={() => setShowDate(true)}
                    >
                      <Text style={form.ngaySinh ? styles.inputText : styles.placeholderText}>
                        {form.ngaySinh || "Chọn ngày sinh"}
                      </Text>
                    </TouchableOpacity>

                    <Text style={styles.optionalNote}>* Không bắt buộc</Text>

                    {showDate && (
                      <DateTimePicker
                        value={
                          form.ngaySinh && !isNaN(new Date(form.ngaySinh))
                            ? new Date(form.ngaySinh)
                            : new Date()
                        }
                        mode="date"
                        display={Platform.OS === "ios" ? "spinner" : "default"}
                        onChange={(event, date) => {
                          setShowDate(false);

                          if (date) {
                            setForm({
                              ...form,
                              ngaySinh: formatDateInput(date),
                            });
                          }
                        }}
                      />
                    )}

                    <Text style={styles.label}>
                      {modalMode === "edit"
                        ? "Nhóm-môn của sinh viên"
                        : "Chọn nhóm-môn"}
                    </Text>

                    <Text style={styles.smallNote}>
                      {modalMode === "edit"
                        ? "Có thể chọn nhiều nhóm-môn. Email không được sửa."
                        : "Có thể chọn nhiều nhóm-môn cho cùng một sinh viên."}
                    </Text>

                    <View style={styles.classListBox}>
                      {groups.length > 0 ? (
                        groups.map(renderGroupCheckbox)
                      ) : (
                        <Text style={styles.emptyClass}>Chưa có nhóm-môn</Text>
                      )}
                    </View>

                    <Text style={styles.fieldError}>{getError("MaNhoms")}</Text>

                    <Text style={styles.label}>Trạng thái</Text>
                    <View style={styles.selectRow}>
                      <TouchableOpacity
                        style={[
                          styles.selectOption,
                          form.trangThai === true && styles.selectOptionActive,
                        ]}
                        onPress={() => setForm({ ...form, trangThai: true })}
                      >
                        <Text
                          style={[
                            styles.selectText,
                            form.trangThai === true && styles.selectTextActive,
                          ]}
                        >
                          Hoạt động
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.selectOption,
                          form.trangThai === false && styles.selectOptionActive,
                        ]}
                        onPress={() => setForm({ ...form, trangThai: false })}
                      >
                        <Text
                          style={[
                            styles.selectText,
                            form.trangThai === false && styles.selectTextActive,
                          ]}
                        >
                          Khóa
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                      style={styles.saveBtn}
                      onPress={handleSave}
                      disabled={saving}
                    >
                      <Text style={styles.whiteBtnText}>
                        {saving
                          ? "Đang lưu..."
                          : modalMode === "edit"
                          ? "Lưu"
                          : "Thêm vào lớp"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                <TouchableOpacity style={styles.closeBtn} onPress={closeMainModal}>
                  <Text style={styles.closeText}>Đóng</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        <Modal visible={deleteModalVisible} animationType="fade" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.deleteBox}>
              <Text style={styles.deleteTitle}>Xóa sinh viên khỏi lớp-môn</Text>

              <Text style={styles.deleteDesc}>
                Bạn muốn xóa{" "}
                <Text style={styles.deleteName}>{deleteItem?.HoTen}</Text> khỏi
                lớp-môn nào?
              </Text>

              <View style={styles.classListBox}>
                {getItemGroups(deleteItem).length > 0 ? (
                  getItemGroups(deleteItem).map(renderDeleteGroupCheckbox)
                ) : (
                  <Text style={styles.emptyClass}>Sinh viên chưa có nhóm-môn</Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.deleteConfirmBtn}
                onPress={handleDelete}
                disabled={saving}
              >
                <Text style={styles.whiteBtnText}>
                  {saving ? "Đang xóa..." : "Xóa khỏi lớp"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.closeBtn} onPress={closeDeleteModal}>
                <Text style={styles.closeText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {editingLoading && (
          <View style={styles.fullLoading}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Đang tải form sửa...</Text>
          </View>
        )}
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6fb",
    padding: 14,
  },

  cardBox: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 15,
    marginBottom: 14,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  titleRow: {
  marginBottom: 12,
},

actionGroup: {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
  rowGap: 10,
  marginBottom: 14,
},

actionBtn: {
  width: "48%",
  paddingVertical: 12,
  borderRadius: 10,
  alignItems: "center",
  justifyContent: "center",
},

addBtn: {
  backgroundColor: "#43a047",
},

importBtn: {
  backgroundColor: "#f0ad4e",
},

exportAllBtn: {
  backgroundColor: "#2e7d32",
},

exportClassBtn: {
  backgroundColor: "#1565c0",
},

  whiteBtnText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
  },

  searchRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },

  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  searchBtn: {
    backgroundColor: "#0d6efd",
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 10,
  },

  filterScroll: {
    gap: 8,
    paddingVertical: 4,
  },

  filterChip: {
    borderWidth: 1,
    borderColor: "#d9e2ef",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },

  filterChipActive: {
    backgroundColor: "#e3f2fd",
    borderColor: "#1565c0",
  },

  filterChipText: {
    color: "#555",
    fontSize: 13,
    fontWeight: "500",
  },

  filterChipTextActive: {
    color: "#1565c0",
    fontWeight: "700",
  },

  clearFilterBtn: {
    marginTop: 8,
    alignSelf: "flex-start",
    paddingVertical: 4,
  },

  clearFilterText: {
    color: "#1565c0",
    fontWeight: "600",
  },

  loadingBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 8,
    color: "#666",
  },

  listContent: {
    paddingBottom: 10,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginBottom: 13,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 12,
  },

  infoLeft: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  avatarText: {
    fontWeight: "800",
    color: "#333",
  },

  infoTextBox: {
    flex: 1,
  },

  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  email: {
    color: "#666",
    marginTop: 2,
  },

  statusPill: {
    alignSelf: "flex-start",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },

  statusOnBg: {
    backgroundColor: "#e8f5e9",
  },

  statusOffBg: {
    backgroundColor: "#ffebee",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },

  statusOn: {
    color: "#2e7d32",
  },

  statusOff: {
    color: "#c62828",
  },

  rowInfo: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
  },

  infoCol: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 13,
    color: "#777",
    marginBottom: 3,
    fontWeight: "600",
  },

  infoValue: {
    color: "#222",
    fontWeight: "500",
  },

  sectionBlock: {
    marginBottom: 10,
  },

  badgeWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },

  classBadge: {
    backgroundColor: "#e3f2fd",
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  classBadgeText: {
    color: "#1565c0",
    fontSize: 13,
    fontWeight: "600",
  },

  emptyClass: {
    color: "#999",
    fontStyle: "italic",
    marginTop: 4,
  },

  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },

  editBtn: {
    flex: 1,
    backgroundColor: "#fff7ed",
    borderWidth: 1,
    borderColor: "#fdba74",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  deleteBtn: {
    flex: 1.4,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  actionText: {
    fontWeight: "700",
    color: "#374151",
  },

  emptyBox: {
    backgroundColor: "#fff",
    padding: 28,
    alignItems: "center",
    borderRadius: 15,
  },

  emptyText: {
    color: "#777",
    fontSize: 15,
  },

  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },

  pageBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },

  pageBtnDisabled: {
    opacity: 0.4,
  },

  pageBtnText: {
    color: "#333",
    fontWeight: "700",
  },

  pageText: {
    fontWeight: "700",
    color: "#333",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 16,
  },

  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    maxHeight: "92%",
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
    color: "#1f2937",
  },

  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginBottom: 15,
  },

  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },

  tabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#0d6efd",
  },

  tabText: {
    color: "#555",
    fontWeight: "600",
  },

  tabTextActive: {
    color: "#0d6efd",
    fontWeight: "700",
  },

  label: {
    fontWeight: "700",
    marginBottom: 6,
    color: "#333",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 5,
    backgroundColor: "#fff",
  },

  readonlyInput: {
    backgroundColor: "#f3f3f3",
    color: "#777",
  },

  inputText: {
    color: "#111",
  },

  placeholderText: {
    color: "#999",
  },

  optionalNote: {
    color: "#dc3545",
    fontSize: 13,
    marginBottom: 10,
  },

  smallNote: {
    color: "#777",
    fontSize: 13,
    marginTop: -2,
    marginBottom: 10,
  },

  fieldError: {
    minHeight: 18,
    color: "#dc3545",
    fontSize: 13,
    marginBottom: 5,
  },

  selectRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },

  selectOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: "center",
    backgroundColor: "#fff",
  },

  selectOptionActive: {
    backgroundColor: "#e3f2fd",
    borderColor: "#1565c0",
  },

  selectText: {
    color: "#555",
    fontWeight: "600",
  },

  selectTextActive: {
    color: "#1565c0",
    fontWeight: "800",
  },

  classListBox: {
    maxHeight: 190,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#fafafa",
    marginBottom: 5,
  },

  classItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    borderRadius: 6,
  },

  classItemActive: {
    backgroundColor: "#f1f7ff",
  },

  classItemDanger: {
    backgroundColor: "#fff1f2",
  },

  checkbox: {
    fontSize: 18,
    color: "#1565c0",
  },

  classItemText: {
    flex: 1,
    color: "#333",
    fontWeight: "500",
  },

  saveBtn: {
    backgroundColor: "#0d6efd",
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },

  importLargeBtn: {
    backgroundColor: "#0d6efd",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },

  closeBtn: {
    backgroundColor: "#6c757d",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  closeText: {
    color: "#fff",
    fontWeight: "700",
  },

  deleteBox: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    maxHeight: "80%",
  },

  deleteTitle: {
    fontSize: 19,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },

  deleteDesc: {
    textAlign: "center",
    marginBottom: 14,
    color: "#333",
  },

  deleteName: {
    fontWeight: "800",
  },

  deleteConfirmBtn: {
    backgroundColor: "#dc3545",
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },

  fullLoading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
});

