import React, { useEffect, useState } from "react";
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
} from "react-native";

import { getNhom, createNhom } from "../api";

export default function NhomScreen() {
  const [nhom, setNhom] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  // create modal
  const [modalVisible, setModalVisible] = useState(false);
  const [tenNhom, setTenNhom] = useState("");
  const [maMonHoc, setMaMonHoc] = useState("");

  // =====================
  // LOAD DATA
  // =====================
  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getNhom();

      setNhom(data);
      setFiltered(data);
    } catch (err) {
      console.log(err);
      Alert.alert("Lỗi", "Không kết nối server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =====================
  // SEARCH
  // =====================
  const handleSearch = (text) => {
    setSearch(text);

    if (!text) {
      setFiltered(nhom);
      return;
    }

    const result = nhom.filter((item) =>
      item.TenNhom?.toLowerCase().includes(text.toLowerCase())
    );

    setFiltered(result);
  };

  // =====================
  // CREATE CLASS
  // =====================
  const handleCreate = async () => {
    if (!tenNhom || !maMonHoc) {
      Alert.alert("Thiếu thông tin");
      return;
    }

    try {
      const res = await createNhom({
        TenNhom: tenNhom,
        MaMonHoc: parseInt(maMonHoc), // 👈 FIX QUAN TRỌNG
      });

      console.log("CREATE OK:", res);

      Alert.alert(
        "Thành công",
        `Tạo lớp thành công\nMã mời: ${res.MaMoi || ""}`
      );

      setTenNhom("");
      setMaMonHoc("");
      setModalVisible(false);

      loadData();
    } catch (err) {
      console.log("CREATE ERROR:", err.response?.data || err.message);
      Alert.alert("Lỗi", "Không tạo được lớp");
    }
  };

  // =====================
  // UI ITEM
  // =====================
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.TenNhom}</Text>
      <Text>Môn: {item.TenMonHoc}</Text>
      <Text>Sĩ số: {item.SiSo}</Text>
      <Text>Mã mời: {item.MaMoi}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📚 Quản lý lớp học</Text>

      {/* SEARCH + BUTTON */}
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
      ) : filtered.length === 0 ? (
        <Text>Không có lớp nào</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.MaNhom.toString()}
          renderItem={renderItem}
        />
      )}

      {/* MODAL CREATE */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>➕ Tạo lớp học</Text>

          <TextInput
            placeholder="Tên lớp"
            value={tenNhom}
            onChangeText={setTenNhom}
            style={styles.input}
          />

          <TextInput
            placeholder="Mã môn học (số)"
            value={maMonHoc}
            onChangeText={setMaMonHoc}
            keyboardType="numeric"
            style={styles.input}
          />

          <TouchableOpacity style={styles.btn} onPress={handleCreate}>
            <Text style={{ color: "#fff" }}>Tạo lớp</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Text style={{ marginTop: 15, color: "red", textAlign: "center" }}>
              Đóng
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

// =====================
// STYLE
// =====================
const styles = StyleSheet.create({
  container: { flex: 1,paddingTop: 80, padding: 15, backgroundColor: "#f2f4f8" },

  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
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
    marginBottom: 5,
  },

  modal: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f9f9f9",
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
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },

  btn: {
    backgroundColor: "#2196F3",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});