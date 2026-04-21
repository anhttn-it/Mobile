import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  RefreshControl,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import MainLayout from "../../components/MainLayout";
import {
  getNhom,
  createNhom,
  getNhomDetail,
  deleteNhom,
  addStudent,
  removeStudent,
} from "../../api/nhom";

import { getMonHoc } from "../../api/monhoc";
import { AuthContext } from "../../context/AuthContext";

export default function NhomScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  const [nhom, setNhom] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  const [monHocList, setMonHocList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [tenNhom, setTenNhom] = useState("");
  const [maMonHoc, setMaMonHoc] = useState(null);

  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupDetail, setGroupDetail] = useState({ students: [] });
  const [email, setEmail] = useState("");

  // ================= LOAD =================
  const loadData = async () => {
    if (!user?.userId) return;

    try {
      setLoading(true);

      const [nhomData, monData] = await Promise.all([
        getNhom(user.userId),
        getMonHoc(user.userId),
      ]);

      setNhom(nhomData || []);
      setFiltered(nhomData || []);
      setMonHocList(monData?.data || monData || []);
    } catch (err) {
      Alert.alert("Lỗi", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSearch = (text) => {
    setSearch(text);

    if (!text) return setFiltered(nhom);

    setFiltered(
      nhom.filter((i) =>
        i.TenNhom?.toLowerCase().includes(text.toLowerCase())
      )
    );
  };

  const handleCreate = async () => {
    if (!tenNhom || !maMonHoc) {
      Alert.alert("Thiếu thông tin");
      return;
    }

    try {
      const res = await createNhom({
        TenNhom: tenNhom,
        MaMonHoc: maMonHoc,
        GiangVien: user.userId,
      });

      Alert.alert("Thành công", `Mã mời: ${res.MaMoi}`);

      setTenNhom("");
      setMaMonHoc(null);
      setModalVisible(false);

      loadData();
    } catch (err) {
      Alert.alert("Lỗi", err.message);
    }
  };

  const openGroup = async (item) => {
    try {
      setSelectedGroup(item);
      setDetailVisible(true);
      setGroupDetail({ students: [] });

      const data = await getNhomDetail(item.MaNhom);

      setGroupDetail({
        ...data,
        students: data?.students || [],
      });
    } catch (err) {
      Alert.alert("Lỗi", err.message);
    }
  };

  const handleAddStudent = async () => {
    try {
      await addStudent(selectedGroup.MaNhom, email);
      setEmail("");

      const data = await getNhomDetail(selectedGroup.MaNhom);
      setGroupDetail({
        ...data,
        students: data?.students || [],
      });

      await loadData();
    } catch (err) {
      Alert.alert("Lỗi", err.message);
    }
  };

  const handleRemoveStudent = async (id) => {
    try {
      await removeStudent(selectedGroup.MaNhom, id);

      const data = await getNhomDetail(selectedGroup.MaNhom);
      setGroupDetail({
        ...data,
        students: data?.students || [],
      });

      await loadData();
    } catch (err) {
      Alert.alert("Lỗi", err.message);
    }
  };

  const handleDeleteGroup = () => {
    Alert.alert("Xác nhận", "Xóa nhóm này?", [
      { text: "Hủy" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          await deleteNhom(selectedGroup.MaNhom);
          setDetailVisible(false);
          loadData();
        },
      },
    ]);
  };

  return (
    <MainLayout title="📚 Lớp của tôi" navigation={navigation}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>

          {/* TOP */}
          <View style={styles.topBar}>
            <TextInput
              placeholder="Tìm lớp..."
              value={search}
              onChangeText={handleSearch}
              style={styles.search}
            />

            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setModalVisible(true)}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>+ Tạo</Text>
            </TouchableOpacity>
          </View>

          {/* LIST */}
          {loading ? (
            <ActivityIndicator size="large" />
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(i) => i.MaNhom.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => openGroup(item)}>
                  <View style={styles.card}>
                    <Text style={styles.title}>{item.TenNhom}</Text>
                    <Text>📘 Môn: {item.TenMonHoc}</Text>
                    <Text>👨‍🎓 Sĩ số: {item.SiSo}</Text>
                    <Text style={{ color: "#2563eb", marginTop: 5 }}>
                      🔑 Mã mời: {item.MaMoi}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          )}

          {/* ================= DETAIL (FIX UI ONLY) ================= */}
          <Modal visible={detailVisible} animationType="slide">
            <View style={styles.detailWrapper}>

              <View style={styles.detailCard}>

                <Text style={styles.modalTitle}>
                  {selectedGroup?.TenNhom}
                </Text>

                <Text style={styles.codeBox}>
                  🔑 Mã mời: {selectedGroup?.MaMoi}
                </Text>

                <TextInput
                  placeholder="Email học viên"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                />

                {/* button nhỏ hơn, không full width */}
                <TouchableOpacity
                  style={styles.addStudentBtn}
                  onPress={handleAddStudent}
                >
                  <Text style={{ color: "#fff", fontWeight: "600" }}>
                    + Thêm học viên
                  </Text>
                </TouchableOpacity>

                <FlatList
                  data={groupDetail.students}
                  keyExtractor={(i, idx) => idx.toString()}
                  contentContainerStyle={{ paddingBottom: 10 }}
                  renderItem={({ item }) => (
                    <View style={styles.studentRow}>
                      <Text style={{ flex: 1 }}>{item.Email}</Text>

                      <TouchableOpacity
                        style={styles.deleteStudentBtn}
                        onPress={() =>
                          handleRemoveStudent(item.MaNguoiDung)
                        }
                      >
                        <Text style={{ color: "#fff", fontSize: 12 }}>
                          Xóa
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                />

                {/* bottom buttons row */}
                <View style={styles.bottomRow}>

                  <TouchableOpacity
                    style={styles.dangerBtn}
                    onPress={handleDeleteGroup}
                  >
                    <Text style={{ color: "#fff", fontWeight: "600" }}>
                      Xóa nhóm
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={() => setDetailVisible(false)}
                  >
                    <Text style={{ fontWeight: "600" }}>Đóng</Text>
                  </TouchableOpacity>

                </View>

              </View>
            </View>
          </Modal>

        </View>
      </SafeAreaView>
    </MainLayout>
  );
}

/* ================= STYLE (ONLY UI FIX) ================= */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f4f6fb" },

  topBar: { flexDirection: "row", marginBottom: 10 },

  search: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  addBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 10,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },

  title: { fontSize: 16, fontWeight: "700" },

  /* ===== DETAIL CENTER FIX ===== */
  detailWrapper: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 20,
  },

  detailCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    maxHeight: "85%",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },

  codeBox: {
    color: "#2563eb",
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },

  addStudentBtn: {
    backgroundColor: "#2563eb",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    alignSelf: "center",
    paddingHorizontal: 18,
    marginBottom: 10,
  },

  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },

  deleteStudentBtn: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 10,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 10,
  },

  dangerBtn: {
    flex: 1,
    backgroundColor: "#ef4444",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  closeBtn: {
    flex: 1,
    backgroundColor: "#e5e7eb",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
});