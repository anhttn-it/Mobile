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
  Platform,
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

import { AuthContext } from "../../context/AuthContext";

export default function NhomScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  const [nhom, setNhom] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // CREATE MODAL
  const [modalVisible, setModalVisible] = useState(false);
  const [tenNhom, setTenNhom] = useState("");
  const [maMonHoc, setMaMonHoc] = useState("");

  // DETAIL MODAL
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupDetail, setGroupDetail] = useState(null);
  const [email, setEmail] = useState("");

  // =====================
  // LOAD DATA
  // =====================
  const loadData = async () => {
    if (!user?.userId) return;

    try {
      setLoading(true);
      const data = await getNhom(user.userId);

      setNhom(data);
      setFiltered(data);
    } catch (err) {
      Alert.alert("Lỗi", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // =====================
  // REFRESH
  // =====================
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // =====================
  // SEARCH
  // =====================
  const handleSearch = (text) => {
    setSearch(text);

    if (!text) {
      setFiltered(nhom);
      return;
    }

    setFiltered(
      nhom.filter((item) =>
        item.TenNhom?.toLowerCase().includes(text.toLowerCase())
      )
    );
  };

  // =====================
  // CREATE GROUP
  // =====================
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
      setMaMonHoc("");
      setModalVisible(false);

      loadData();
    } catch (err) {
      Alert.alert("Lỗi", err.message);
    }
  };

  // =====================
  // OPEN GROUP DETAIL
  // =====================
  const openGroup = async (item) => {
    try {
      setSelectedGroup(item);
      setDetailVisible(true);

      const data = await getNhomDetail(item.MaNhom);
      setGroupDetail(data);
    } catch (err) {
      Alert.alert("Lỗi", err.message);
    }
  };

  // =====================
  // ADD STUDENT
  // =====================
  const handleAddStudent = async () => {
  try {
    await addStudent(selectedGroup.MaNhom, email);
    setEmail("");

    // 🔥 1. refresh chi tiết nhóm
    const data = await getNhomDetail(selectedGroup.MaNhom);
    setGroupDetail(data);

    // 🔥 2. refresh danh sách nhóm để cập nhật SiSo
    await loadData();

  } catch (err) {
    Alert.alert("Lỗi", err.message);
  }
};

  // =====================
  // REMOVE STUDENT
  // =====================
const handleRemoveStudent = async (id) => {
  try {
    await removeStudent(selectedGroup.MaNhom, id);

    const data = await getNhomDetail(selectedGroup.MaNhom);
    setGroupDetail(data);

    await loadData();
  } catch (err) {
    Alert.alert("Lỗi", err.message);
  }
};
  // =====================
  // DELETE GROUP
  // =====================
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

  // =====================
  // RENDER ITEM
  // =====================
  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => openGroup(item)}>
      <View style={styles.card}>
        <Text style={styles.title}>{item.TenNhom}</Text>
        <Text>📘 Môn: {item.TenMonHoc}</Text>
        <Text>👨‍🎓 Sĩ số: {item.SiSo}</Text>
        <Text>🔑 Mã mời: {item.MaMoi}</Text>
      </View>
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Đang tải user...</Text>
      </View>
    );
  }

  return (
    <MainLayout title="📚 Lớp của tôi" navigation={navigation}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>

          {/* SEARCH + CREATE */}
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
              <Text style={{ color: "#fff" }}>+ Tạo</Text>
            </TouchableOpacity>
          </View>

          {/* LIST */}
          {loading ? (
            <ActivityIndicator size="large" />
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.MaNhom.toString()}
              renderItem={renderItem}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          )}

          {/* CREATE MODAL */}
          <Modal visible={modalVisible} animationType="slide">
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>➕ Tạo lớp</Text>

              <TextInput
                placeholder="Tên lớp"
                value={tenNhom}
                onChangeText={setTenNhom}
                style={styles.input}
              />

              <TextInput
                placeholder="Mã môn học"
                value={maMonHoc}
                onChangeText={setMaMonHoc}
                keyboardType="numeric"
                style={styles.input}
              />

              <TouchableOpacity style={styles.btn} onPress={handleCreate}>
                <Text style={{ color: "#fff" }}>Tạo</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.close}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </Modal>

          {/* DETAIL MODAL */}
          <Modal visible={detailVisible} animationType="slide">
            <View style={styles.modal}>

              <Text style={styles.modalTitle}>
                {selectedGroup?.TenNhom}
              </Text>

              <Text>Mã mời: {selectedGroup?.MaMoi}</Text>

              <TextInput
                placeholder="Email học viên"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
              />

              <TouchableOpacity style={styles.btn} onPress={handleAddStudent}>
                <Text style={{ color: "#fff" }}>Thêm học viên</Text>
              </TouchableOpacity>

              <FlatList
                data={groupDetail?.students || []}
                keyExtractor={(i) => i.MaNguoiDung?.toString()}
                renderItem={({ item }) => (
                  <View style={styles.studentRow}>
                    <Text>{item.Email}</Text>
                    <TouchableOpacity onPress={() => handleRemoveStudent(item.MaNguoiDung)}>
                      <Text style={{ color: "red" }}>Xóa</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />

              <TouchableOpacity
                style={[styles.btn, { backgroundColor: "red", marginTop: 10 }]}
                onPress={handleDeleteGroup}
              >
                <Text style={{ color: "#fff" }}>Xóa nhóm</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setDetailVisible(false)}>
                <Text style={styles.close}>Đóng</Text>
              </TouchableOpacity>

            </View>
          </Modal>

        </View>
      </SafeAreaView>
    </MainLayout>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    paddingTop: 10, // 👈 tránh dính status bar
    backgroundColor: "#f2f4f8",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  topBar: {
    flexDirection: "row",
    marginBottom: 10,
  },

  search: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    backgroundColor: "#fff",
  },

  addBtn: {
    backgroundColor: "green",
    justifyContent: "center",
    paddingHorizontal: 15,
    borderRadius: 8,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 3,
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
  },

  // =========================
  // MODAL FIX SAFE TOP + BOTTOM
  // =========================
  modal: {
    flex: 1,
    justifyContent: "center", // 👈 cách trên + dưới đều nhau
    paddingHorizontal: 20,

    paddingTop: Platform.OS === "ios" ? 60 : 20,   // 👈 tránh tai thỏ
    paddingBottom: Platform.OS === "ios" ? 40 : 20, // 👈 tránh home indicator

    backgroundColor: "#fff",
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
  },

  btn: {
    backgroundColor: "#2196F3",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  close: {
    marginTop: 10,
    color: "red",
    textAlign: "center",
  },

  studentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
  },
});