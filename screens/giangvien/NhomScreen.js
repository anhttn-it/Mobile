import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
} from "react-native";

import MainLayout from "../../components/MainLayout";
import { AuthContext } from "../../context/AuthContext";

import {
  getNhom,
  getMonHocGV,
  createNhom,
  deleteNhom,
  getNhomDetail,
  addStudent,
  removeStudent,
  getNhomId,
  getNhomName,
  getNhomSubjectName,
  getNhomInviteCode,
  getNhomSize,
  getStudentId,
  getStudentName,
  getStudentEmail,
} from "../../api/nhom";

export default function NhomScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  const [groups, setGroups] = useState([]);
  const [monHocList, setMonHocList] = useState([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [createVisible, setCreateVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);

  const [tenNhom, setTenNhom] = useState("");
  const [selectedMonHoc, setSelectedMonHoc] = useState(null);

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentEmail, setStudentEmail] = useState("");

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

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(String(email || "").trim());
  };

  const updateGroupInList = (updatedGroup) => {
    if (!updatedGroup) return;

    const updatedId = getNhomId(updatedGroup);

    if (!updatedId) return;

    setGroups((prev) =>
      prev.map((g) => (getNhomId(g) === updatedId ? updatedGroup : g))
    );
  };

  // ====================
  // LOAD DATA
  // ====================
  const loadData = async (keyword = search) => {
    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
      setGroups([]);
      setMonHocList([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [groupRes, monHocRes] = await Promise.all([
        getNhom(currentUserId, keyword),
        getMonHocGV(currentUserId),
      ]);

      setGroups(groupRes.data || groupRes.Data || []);
      setMonHocList(monHocRes.data || monHocRes.Data || []);
    } catch (err) {
      Alert.alert("Lỗi", err.message || "Không thể tải danh sách lớp");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData("");
  }, [user]);

  // ====================
  // REFRESH
  // ====================
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData(search);
    setRefreshing(false);
  };

  // ====================
  // SEARCH
  // ====================
  const handleSearch = async (text) => {
    setSearch(text);

    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
      setGroups([]);
      return;
    }

    try {
      const res = await getNhom(currentUserId, text);
      setGroups(res.data || res.Data || []);
    } catch (err) {
      Alert.alert("Lỗi", err.message || "Không thể tìm kiếm lớp");
    }
  };

  // ====================
  // CREATE
  // ====================
  const resetCreateForm = () => {
    setTenNhom("");
    setSelectedMonHoc(null);
    setSaving(false);
  };

  const openCreate = () => {
    resetCreateForm();
    setCreateVisible(true);
  };

  const handleCreate = async () => {
    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
      Alert.alert("Lỗi", "Không tìm thấy mã giảng viên");
      return;
    }

    if (!tenNhom.trim()) {
      Alert.alert("Thông báo", "Tên lớp không được để trống");
      return;
    }

    if (!selectedMonHoc) {
      Alert.alert("Thông báo", "Vui lòng chọn môn học");
      return;
    }

    try {
      setSaving(true);

      const res = await createNhom({
        userId: currentUserId,
        tenNhom: tenNhom.trim(),
        maMonHoc: selectedMonHoc,
      });

      Alert.alert("Thành công", res.message || "Tạo lớp thành công");
      setCreateVisible(false);
      resetCreateForm();
      loadData(search);
    } catch (err) {
      Alert.alert("Lỗi", err.message || "Tạo lớp thất bại");
    } finally {
      setSaving(false);
    }
  };

  // ====================
  // DETAIL
  // ====================
  const openDetail = async (item) => {
    const currentUserId = getCurrentUserId();
    const maNhom = getNhomId(item);

    if (!currentUserId) {
      Alert.alert("Lỗi", "Không tìm thấy mã giảng viên");
      return;
    }

    if (!maNhom) {
      Alert.alert("Lỗi", "Thiếu mã nhóm");
      return;
    }

    try {
      setLoading(true);

      const res = await getNhomDetail(currentUserId, maNhom);

      setSelectedGroup(res.data || item);
      setStudents(res.students || res.sinhVien || res.SinhVien || []);
      setStudentEmail("");
      setDetailVisible(true);
    } catch (err) {
      Alert.alert("Lỗi", err.message || "Không thể xem chi tiết lớp");
    } finally {
      setLoading(false);
    }
  };

  const reloadDetail = async () => {
    const currentUserId = getCurrentUserId();
    const maNhom = getNhomId(selectedGroup);

    if (!currentUserId || !maNhom) return;

    const res = await getNhomDetail(currentUserId, maNhom);
    const updatedGroup = res.data || selectedGroup;
    const updatedStudents = res.students || res.sinhVien || res.SinhVien || [];

    setSelectedGroup(updatedGroup);
    setStudents(updatedStudents);
    updateGroupInList(updatedGroup);
  };

  // ====================
  // DELETE GROUP
  // ====================
  const handleDelete = (item) => {
    const currentUserId = getCurrentUserId();
    const maNhom = getNhomId(item);

    if (!currentUserId) {
      Alert.alert("Lỗi", "Không tìm thấy mã giảng viên");
      return;
    }

    Alert.alert("Xóa lớp", "Xóa lớp này?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await deleteNhom(currentUserId, maNhom);

            Alert.alert("Thành công", res.message || "Xóa lớp thành công");
            loadData(search);
          } catch (err) {
            Alert.alert("Lỗi", err.message || "Không thể xóa lớp");
          }
        },
      },
    ]);
  };

  // ====================
  // ADD STUDENT
  // ====================
  const handleAddStudent = async () => {
    const currentUserId = getCurrentUserId();
    const maNhom = getNhomId(selectedGroup);
    const email = studentEmail.trim();

    if (!currentUserId) {
      Alert.alert("Lỗi", "Không tìm thấy mã giảng viên");
      return;
    }

    if (!maNhom) {
      Alert.alert("Lỗi", "Thiếu mã nhóm");
      return;
    }

    if (!email) {
      Alert.alert("Thông báo", "Vui lòng nhập email sinh viên");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Thông báo", "Email không đúng định dạng");
      return;
    }

    try {
      setSaving(true);

      const res = await addStudent(currentUserId, maNhom, email);

      const updatedGroup = res.data || selectedGroup;
      const updatedStudents = res.sinhVien || res.SinhVien || res.students || [];

      setSelectedGroup(updatedGroup);
      setStudents(updatedStudents);
      updateGroupInList(updatedGroup);
      setStudentEmail("");

      Alert.alert("Thành công", res.message || "Thêm sinh viên thành công");

      // Reload lại list chính để card bên ngoài cũng cập nhật sĩ số chắc chắn.
      await loadData(search);
    } catch (err) {
      Alert.alert("Lỗi", err.message || "Không thể thêm sinh viên");
    } finally {
      setSaving(false);
    }
  };

  // ====================
  // REMOVE STUDENT
  // ====================
  const handleRemoveStudent = (sv) => {
    const currentUserId = getCurrentUserId();
    const maNhom = getNhomId(selectedGroup);
    const maNguoiDung = getStudentId(sv);

    if (!currentUserId || !maNhom || !maNguoiDung) {
      Alert.alert("Lỗi", "Thiếu dữ liệu xóa sinh viên");
      return;
    }

    Alert.alert("Xóa sinh viên", "Xóa sinh viên này khỏi lớp?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await removeStudent(
              currentUserId,
              maNhom,
              maNguoiDung
            );

            const updatedGroup = res.data || selectedGroup;
            const updatedStudents =
              res.sinhVien || res.SinhVien || res.students || [];

            setSelectedGroup(updatedGroup);
            setStudents(updatedStudents);
            updateGroupInList(updatedGroup);

            Alert.alert("Thành công", res.message || "Đã xóa sinh viên");

            // Reload lại list chính để card bên ngoài cũng cập nhật sĩ số chắc chắn.
            await loadData(search);
          } catch (err) {
            Alert.alert("Lỗi", err.message || "Không thể xóa sinh viên");
          }
        },
      },
    ]);
  };

  // ====================
  // RENDER GROUP ITEM
  // ====================
  const renderGroupItem = ({ item }) => {
    const tenNhomDisplay = getNhomName(item);
    const tenMonHoc = getNhomSubjectName(item);
    const maMoi = getNhomInviteCode(item);
    const siSo = getNhomSize(item);

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📚 {tenNhomDisplay}</Text>

        <Text style={styles.cardInfo}>
          📘 Môn học:{" "}
          <Text style={styles.bold}>{tenMonHoc || "Không có môn học"}</Text>
        </Text>

        <Text style={styles.cardInfo}>
          👨‍🎓 Sĩ số: <Text style={styles.bold}>{siSo}</Text>
        </Text>

        {!!maMoi && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Mã mời: {maMoi}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.btnDetail}
            onPress={() => openDetail(item)}
          >
            <Text style={styles.btnText}>Chi tiết</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnDelete}
            onPress={() => handleDelete(item)}
          >
            <Text style={styles.btnText}>Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ====================
  // RENDER STUDENT ITEM
  // ====================
  const renderStudentItem = ({ item }) => {
    const name = getStudentName(item);
    const email = getStudentEmail(item);

    return (
      <View style={styles.studentRow}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{name || "Chưa có tên"}</Text>
          <Text style={styles.studentEmail}>{email || "Chưa có email"}</Text>
        </View>

        <TouchableOpacity
          style={styles.btnStudentDelete}
          onPress={() => handleRemoveStudent(item)}
        >
          <Text style={styles.btnTextSmall}>Xóa</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && !refreshing && !createVisible && !detailVisible) {
    return (
      <MainLayout navigation={navigation} title="📚 Danh sách lớp">
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Đang tải danh sách lớp...</Text>
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout navigation={navigation} title="📚 Danh sách lớp">
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>📚 Danh sách lớp</Text>

          <TouchableOpacity style={styles.btnCreate} onPress={openCreate}>
            <Text style={styles.btnCreateText}>+ Tạo lớp</Text>
          </TouchableOpacity>
        </View>

        {/* SEARCH */}
        <View style={styles.searchWrap}>
          <TextInput
            placeholder="Tìm lớp, môn học, mã mời..."
            placeholderTextColor="#8b95a7"
            value={search}
            onChangeText={handleSearch}
            style={styles.search}
          />
        </View>

        {/* LIST */}
        <FlatList
          data={groups}
          keyExtractor={(item, index) => String(getNhomId(item) || index)}
          renderItem={renderGroupItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>Chưa có lớp nào</Text>
            </View>
          }
        />

        {/* CREATE MODAL */}
        <Modal visible={createVisible} animationType="slide">
          <ScrollView contentContainerStyle={styles.modalContainer}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => {
                setCreateVisible(false);
                resetCreateForm();
              }}
              disabled={saving}
            >
              <Text style={styles.backText}>← Quay lại</Text>
            </TouchableOpacity>

            <View style={styles.formCard}>
              <Text style={styles.modalTitle}>Tạo lớp học</Text>

              <Text style={styles.label}>Tên lớp</Text>
              <TextInput
                value={tenNhom}
                onChangeText={setTenNhom}
                placeholder="Nhập tên lớp..."
                placeholderTextColor="#9ca3af"
                style={styles.input}
              />

              <Text style={styles.label}>Môn học</Text>

              {monHocList.length === 0 ? (
                <View style={styles.emptySubjectBox}>
                  <Text style={styles.emptySubjectText}>
                    Không có môn học
                  </Text>
                </View>
              ) : (
                monHocList.map((mh) => {
                  const active = selectedMonHoc === mh.MaMonHoc;

                  return (
                    <TouchableOpacity
                      key={mh.MaMonHoc}
                      style={[
                        styles.subjectItem,
                        active && styles.subjectItemActive,
                      ]}
                      onPress={() => setSelectedMonHoc(mh.MaMonHoc)}
                    >
                      <Text
                        style={[
                          styles.subjectText,
                          active && styles.subjectTextActive,
                        ]}
                      >
                        {active ? "✅ " : "⬜ "}
                        {mh.TenMonHoc}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}

              <TouchableOpacity
                style={[styles.btnSubmit, saving && styles.btnDisabled]}
                onPress={handleCreate}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.btnSubmitText}>Tạo lớp</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Modal>

        {/* DETAIL MODAL */}
        <Modal visible={detailVisible} animationType="slide">
          <ScrollView contentContainerStyle={styles.modalContainer}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => {
                setDetailVisible(false);
                setSelectedGroup(null);
                setStudents([]);
                setStudentEmail("");
              }}
              disabled={saving}
            >
              <Text style={styles.backText}>← Quay lại</Text>
            </TouchableOpacity>

            {selectedGroup && (
              <>
                {/* THÔNG TIN */}
                <View style={styles.detailCard}>
                  <Text style={styles.detailTitle}>
                    📚 {getNhomName(selectedGroup)}
                  </Text>

                  <Text style={styles.detailInfo}>
                    📖 Môn học:{" "}
                    <Text style={styles.bold}>
                      {getNhomSubjectName(selectedGroup)}
                    </Text>
                  </Text>

                  <Text style={styles.detailInfo}>
                    👨‍🎓 Sĩ số:{" "}
                    <Text style={styles.bold}>
                      {getNhomSize(selectedGroup)}
                    </Text>
                  </Text>

                  {!!getNhomInviteCode(selectedGroup) && (
                    <View style={styles.detailBadge}>
                      <Text style={styles.badgeText}>
                        Mã mời: {getNhomInviteCode(selectedGroup)}
                      </Text>
                    </View>
                  )}
                </View>

                {/* THÊM SINH VIÊN */}
                <View style={styles.detailCard}>
                  <Text style={styles.detailTitle}>➕ Thêm sinh viên</Text>

                  <View style={styles.addStudentRow}>
                    <TextInput
                      value={studentEmail}
                      onChangeText={setStudentEmail}
                      placeholder="Nhập email sinh viên..."
                      placeholderTextColor="#9ca3af"
                      style={styles.studentInput}
                      keyboardType="email-address"
                      autoCorrect={false}
                      autoCapitalize="none"
                    />

                    <TouchableOpacity
                      style={[styles.btnAddStudent, saving && styles.btnDisabled]}
                      onPress={handleAddStudent}
                      disabled={saving}
                    >
                      <Text style={styles.btnText}>Thêm</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* DANH SÁCH SINH VIÊN */}
                <View style={styles.detailCard}>
                  <Text style={styles.detailTitle}>👥 Danh sách sinh viên</Text>

                  {students.length === 0 ? (
                    <Text style={styles.emptyStudentText}>
                      Chưa có sinh viên trong lớp
                    </Text>
                  ) : (
                    <FlatList
                      data={students}
                      keyExtractor={(item, index) =>
                        String(getStudentId(item) || index)
                      }
                      renderItem={renderStudentItem}
                      scrollEnabled={false}
                    />
                  )}
                </View>
              </>
            )}
          </ScrollView>
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
    backgroundColor: "#f4f6fb",
    padding: 15,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    color: "#64748b",
    fontWeight: "700",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  title: {
    fontSize: 23,
    fontWeight: "900",
    color: "#111827",
  },

  btnCreate: {
    backgroundColor: "#4CAF50",
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 10,
    elevation: 2,
  },

  btnCreateText: {
    color: "white",
    fontWeight: "900",
  },

  searchWrap: {
    backgroundColor: "white",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 14,
    elevation: 1,
  },

  search: {
    paddingHorizontal: 13,
    paddingVertical: 12,
    color: "#111827",
  },

  listContent: {
    paddingBottom: 25,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e6edff",
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 10,
    color: "#333",
  },

  cardInfo: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6,
    lineHeight: 21,
  },

  bold: {
    fontWeight: "900",
    color: "#111827",
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#e3f2fd",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginTop: 5,
  },

  badgeText: {
    color: "#1976d2",
    fontWeight: "800",
    fontSize: 13,
  },

  actions: {
    flexDirection: "row",
    marginTop: 15,
    gap: 9,
  },

  btnDetail: {
    flex: 1,
    backgroundColor: "#2196F3",
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: "center",
  },

  btnDelete: {
    flex: 1,
    backgroundColor: "#f44336",
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: "center",
  },

  btnText: {
    color: "white",
    fontWeight: "900",
  },

  emptyBox: {
    marginTop: 90,
    alignItems: "center",
  },

  emptyIcon: {
    fontSize: 42,
    marginBottom: 8,
  },

  emptyText: {
    color: "#64748b",
    fontWeight: "800",
  },

  modalContainer: {
    minHeight: "100%",
    backgroundColor: "#f4f6fb",
    padding: 24,
  },

  backBtn: {
    marginBottom: 15,
  },

  backText: {
    color: "#333",
    fontWeight: "900",
    fontSize: 16,
  },

  formCard: {
    backgroundColor: "white",
    padding: 25,
    borderRadius: 16,
    elevation: 4,
  },

  modalTitle: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 22,
    color: "#111827",
  },

  label: {
    fontWeight: "900",
    color: "#374151",
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    color: "#111827",
  },

  emptySubjectBox: {
    backgroundColor: "#fff7ed",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fed7aa",
    marginBottom: 12,
  },

  emptySubjectText: {
    color: "#c2410c",
    fontWeight: "800",
  },

  subjectItem: {
    padding: 13,
    borderWidth: 1,
    borderColor: "#d9e4ff",
    borderRadius: 12,
    marginBottom: 9,
    backgroundColor: "white",
  },

  subjectItemActive: {
    backgroundColor: "#dbeafe",
    borderColor: "#2196F3",
  },

  subjectText: {
    color: "#334155",
    fontWeight: "800",
  },

  subjectTextActive: {
    color: "#1d4ed8",
  },

  btnSubmit: {
    marginTop: 12,
    backgroundColor: "#28a745",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  btnSubmitText: {
    color: "white",
    fontWeight: "900",
    fontSize: 16,
  },

  btnDisabled: {
    opacity: 0.65,
  },

  detailCard: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 16,
    elevation: 3,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  detailTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 12,
  },

  detailInfo: {
    color: "#555",
    marginBottom: 8,
    fontSize: 15,
    lineHeight: 22,
  },

  detailBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#e3f2fd",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginTop: 4,
  },

  addStudentRow: {
    flexDirection: "row",
    gap: 10,
  },

  studentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 11,
    color: "#111827",
  },

  btnAddStudent: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 15,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  studentInfo: {
    flex: 1,
    paddingRight: 8,
  },

  studentName: {
    color: "#111827",
    fontWeight: "900",
    marginBottom: 3,
  },

  studentEmail: {
    color: "#64748b",
    fontWeight: "600",
  },

  btnStudentDelete: {
    backgroundColor: "#f44336",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
  },

  btnTextSmall: {
    color: "white",
    fontWeight: "900",
    fontSize: 13,
  },

  emptyStudentText: {
    color: "#64748b",
    fontWeight: "800",
    textAlign: "center",
    paddingVertical: 12,
  },
});