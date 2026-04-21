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

import MainLayout from "../../components/MainLayout";
import { AuthContext } from "../../context/AuthContext";

import {
  getNhom,
  createNhom,
  getNhomDetail,
  deleteNhom,
  addStudent,
  removeStudent,
} from "../../api/nhom";

import { getMonHoc } from "../../api/monhoc";

export default function NhomScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  const [nhom, setNhom] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [monHocList, setMonHocList] = useState([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [tenNhom, setTenNhom] = useState("");
  const [maMonHoc, setMaMonHoc] = useState(null);

  // =====================
  // LOAD DATA
  // =====================
  const loadData = async () => {
    try {
      setLoading(true);

      const data = await getNhom(user.userId);
      setNhom(data);
      setFiltered(data);

      const mon = await getMonHoc(user.userId);
      setMonHocList(mon || []);
    } catch (err) {
      Alert.alert("Lỗi", err.message);
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

    setFiltered(
      nhom.filter((i) =>
        i.TenNhom?.toLowerCase().includes(text.toLowerCase())
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
      await createNhom({
        TenNhom: tenNhom,
        MaMonHoc: maMonHoc,
        GiangVien: user.userId,
      });

      setModalVisible(false);
      setTenNhom("");
      setMaMonHoc(null);

      loadData();
    } catch (err) {
      Alert.alert("Lỗi", err.message);
    }
  };

  // =====================
  // RENDER ITEM
  // =====================
  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("Diem", {
          maNhom: item.MaNhom,
          tenNhom: item.TenNhom,
        })
      }
    >
      <View style={styles.card}>
        <Text style={styles.title}>{item.TenNhom}</Text>
        <Text>📘 {item.TenMonHoc}</Text>
        <Text>👨‍🎓 {item.SiSo} sinh viên</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <MainLayout title="📚 Lớp học" navigation={navigation}>
      <View style={styles.container}>

        {/* SEARCH */}
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
          <ActivityIndicator />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(i) => i.MaNhom.toString()}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={loadData} />
            }
          />
        )}

        {/* MODAL CREATE */}
        <Modal visible={modalVisible} animationType="slide">
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>➕ Tạo lớp</Text>

            <TextInput
              placeholder="Tên lớp"
              value={tenNhom}
              onChangeText={setTenNhom}
              style={styles.input}
            />

            {/* ✅ DROPDOWN MÔN */}
            <Text style={{ marginBottom: 5 }}>Chọn môn học</Text>

            {monHocList.map((m) => (
              <TouchableOpacity
                key={m.MaMonHoc}
                style={[
                  styles.dropdownItem,
                  maMonHoc === m.MaMonHoc && styles.selected
                ]}
                onPress={() => setMaMonHoc(m.MaMonHoc)}
              >
                <Text>{m.TenMonHoc}</Text>
              </TouchableOpacity>
            ))}

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
  container: { flex: 1 },

  topBar: {
    flexDirection: "row",
    marginBottom: 10,
  },

  search: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
    marginRight: 10,
  },

  addBtn: {
    backgroundColor: "#2f80ed",
    paddingHorizontal: 15,
    justifyContent: "center",
    borderRadius: 8,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },

  title: {
    fontWeight: "bold",
    fontSize: 16,
  },

  modal: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#fff",
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },

  dropdownItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 5,
  },

  selected: {
    backgroundColor: "#2f80ed33",
  },

  btn: {
    backgroundColor: "#2f80ed",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },

  close: {
    marginTop: 10,
    color: "red",
    textAlign: "center",
  },
});