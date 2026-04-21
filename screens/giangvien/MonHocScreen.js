import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from "react-native";

import MainLayout from "../../components/MainLayout";
import { AuthContext } from "../../context/AuthContext";

import {
  getMonHoc,
  createMonHoc,
  updateMonHoc,
  deleteMonHoc,
} from "../../api/monhoc";

export default function MonHocScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const [tenMon, setTenMon] = useState("");

  /* ================= LOAD ================= */
  const load = async () => {
    try {
      setLoading(true);

      const res = await getMonHoc(user.userId, search);

      setData(res.data || []); // ✅ FIX CRASH
    } catch (err) {
      Alert.alert("Lỗi", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [search]);

  /* ================= REFRESH ================= */
  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    try {
      if (!tenMon) return;

      if (editItem) {
        await updateMonHoc(editItem.MaMonHoc, {
          TenMonHoc: tenMon,
          TrangThai: true,
        });
      } else {
        await createMonHoc({
          TenMonHoc: tenMon,
          GiangVien: user.userId,
          TrangThai: true,
        });
      }

      setModal(false);
      setTenMon("");
      setEditItem(null);

      load();
    } catch (err) {
      Alert.alert("Lỗi", err.message);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = (id) => {
    Alert.alert("Xóa", "Xóa môn học?", [
      { text: "Hủy" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          await deleteMonHoc(id);
          load();
        },
      },
    ]);
  };

  /* ================= ITEM ================= */
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("NhomTheoMon", {
          maMonHoc: item.MaMonHoc,
          tenMon: item.TenMonHoc,
        })
      }
    >
      <Text style={styles.title}>{item.TenMonHoc}</Text>

      <View style={styles.row}>
        <TouchableOpacity
          onPress={() => {
            setEditItem(item);
            setTenMon(item.TenMonHoc);
            setModal(true);
          }}
        >
          <Text style={{ color: "orange" }}>Sửa</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleDelete(item.MaMonHoc)}>
          <Text style={{ color: "red" }}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <MainLayout title="📘 Môn học" navigation={navigation}>
      <View style={styles.container}>

        <TextInput
          placeholder="Tìm môn học..."
          value={search}
          onChangeText={setSearch}
          style={styles.search}
        />

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setModal(true)}
        >
          <Text style={{ color: "#fff" }}>+ Thêm môn</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator />
        ) : (
          <FlatList
            data={data}
            keyExtractor={(i) => i.MaMonHoc.toString()}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}

        {/* MODAL */}
        <Modal visible={modal} animationType="slide">
          <View style={styles.modal}>
            <Text style={styles.title}>
              {editItem ? "Sửa môn học" : "Thêm môn học"}
            </Text>

            <TextInput
              placeholder="Tên môn học"
              value={tenMon}
              onChangeText={setTenMon}
              style={styles.input}
            />

            <TouchableOpacity style={styles.btn} onPress={handleSave}>
              <Text style={{ color: "#fff" }}>Lưu</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModal(false)}>
              <Text style={{ textAlign: "center", marginTop: 10 }}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </Modal>

      </View>
    </MainLayout>
  );
}

/* ================= STYLE ================= */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },

  search: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },

  addBtn: {
    backgroundColor: "#2f80ed",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },

  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  title: { fontWeight: "bold", fontSize: 16 },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  modal: { flex: 1, padding: 20, justifyContent: "center" },

  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },

  btn: {
    backgroundColor: "#2f80ed",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
});