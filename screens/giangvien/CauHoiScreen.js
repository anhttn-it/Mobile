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

import MainLayout from "../../components/MainLayout";
import { AuthContext } from "../../context/AuthContext";
import { getCauHoi, createCauHoi, deleteCauHoi } from "../../api/cauhoi";

export default function CauHoiScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // modal create
  const [modalVisible, setModalVisible] = useState(false);
  const [noiDung, setNoiDung] = useState("");
  const [doKho, setDoKho] = useState("1");
  const [maMonHoc, setMaMonHoc] = useState("");

  // =====================
  // LOAD DATA
  // =====================
  const loadData = async () => {
    if (!user?.userId) return;

    try {
      setLoading(true);
      const res = await getCauHoi(user.userId, null, search);

      setData(res);
      setFiltered(res);
    } catch (err) {
      console.log(err);
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
      setFiltered(data);
      return;
    }

    const result = data.filter((item) =>
      item.NoiDung?.toLowerCase().includes(text.toLowerCase())
    );

    setFiltered(result);
  };

  // =====================
  // CREATE CAU HOI
  // =====================
  const handleCreate = async () => {
    if (!noiDung || !doKho || !maMonHoc) {
      Alert.alert("Thiếu thông tin");
      return;
    }

    try {
      await createCauHoi({
        NoiDung: noiDung,
        DoKho: doKho,
        MaMonHoc: maMonHoc,
        dapAn: ["A", "B", "C", "D"],
        dapAnDung: 0,
        userId: user.userId,
      });

      Alert.alert("Thành công", "Tạo câu hỏi thành công");

      setNoiDung("");
      setDoKho("1");
      setMaMonHoc("");
      setModalVisible(false);

      loadData();
    } catch (err) {
      console.log(err);
      Alert.alert("Lỗi", err.message);
    }
  };

  // =====================
  // DELETE
  // =====================
  const handleDelete = async (id) => {
    Alert.alert("Xác nhận", "Bạn có muốn xóa câu hỏi này?", [
      { text: "Hủy" },
      {
        text: "Xóa",
        onPress: async () => {
          try {
            await deleteCauHoi(id, user.userId);
            loadData();
          } catch (err) {
            Alert.alert("Lỗi", err.message);
          }
        },
      },
    ]);
  };

  // =====================
  // ITEM UI
  // =====================
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>📌 {item.NoiDung}</Text>
      <Text>📊 Độ khó: {item.DoKho}</Text>
      <Text>📘 Môn học: {item.MaMonHoc}</Text>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() =>
            navigation.navigate("EditCauHoi", { id: item.MaCauHoi })
          }
        >
          <Text style={{ color: "#fff" }}>Sửa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item.MaCauHoi)}
        >
          <Text style={{ color: "#fff" }}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // =====================
  // LOADING USER
  // =====================
  if (!user) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Đang tải user...</Text>
      </View>
    );
  }

  return (
    <MainLayout title="📚 Câu hỏi" navigation={navigation}>
      <View style={styles.container}>
        
        {/* SEARCH + ADD */}
        <View style={styles.topBar}>
          <TextInput
            placeholder="Tìm câu hỏi..."
            value={search}
            onChangeText={handleSearch}
            style={styles.search}
          />

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setModalVisible(true)}
          >
            <Text style={{ color: "#fff" }}>+ Thêm</Text>
          </TouchableOpacity>
        </View>

        {/* LIST */}
        {loading ? (
          <ActivityIndicator size="large" />
        ) : filtered.length === 0 ? (
          <Text>Không có câu hỏi</Text>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.MaCauHoi.toString()}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            }
          />
        )}

        {/* MODAL CREATE */}
        <Modal visible={modalVisible} animationType="slide">
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>➕ Tạo câu hỏi</Text>

            <TextInput
              placeholder="Nội dung câu hỏi"
              value={noiDung}
              onChangeText={setNoiDung}
              style={styles.input}
            />

            <TextInput
              placeholder="Độ khó (1-3)"
              value={doKho}
              onChangeText={setDoKho}
              keyboardType="numeric"
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

      </View>
    </MainLayout>
  );
}

// =====================
// STYLE
// =====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
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
    backgroundColor: "#2196F3",
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

  row: {
    flexDirection: "row",
    marginTop: 10,
  },

  editBtn: {
    backgroundColor: "#f39c12",
    padding: 8,
    borderRadius: 8,
    marginRight: 10,
  },

  deleteBtn: {
    backgroundColor: "#e74c3c",
    padding: 8,
    borderRadius: 8,
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

  close: {
    marginTop: 15,
    color: "red",
    textAlign: "center",
  },
});