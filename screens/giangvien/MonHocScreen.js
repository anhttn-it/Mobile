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
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
  const [trangThai, setTrangThai] = useState(true);

  /* ================= LOAD ================= */
  const load = async () => {
    try {
      setLoading(true);

      const res = await getMonHoc(user.userId, search);
      setData(res?.data || []);
    } catch (err) {
      Alert.alert("Lỗi", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [search]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  /* ================= SAVE ================= */
  const handleSave = async () => {
    try {
      if (!tenMon.trim()) return;

      if (editItem) {
        await updateMonHoc(editItem.MaMonHoc, {
          TenMonHoc: tenMon,
          TrangThai: trangThai,
          GiangVien: user.userId,
        });
      } else {
        await createMonHoc({
          TenMonHoc: tenMon,
          GiangVien: user.userId,
          TrangThai: trangThai,
        });
      }

      setModal(false);
      setTenMon("");
      setEditItem(null);
      setTrangThai(true);

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
          await deleteMonHoc(id, user.userId);
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
          tenMonHoc: item.TenMonHoc,
          userId: user.userId,
        })
      }
    >
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{item.TenMonHoc}</Text>

        <View
          style={[
            styles.badge,
            item.TrangThai ? styles.badgeOn : styles.badgeOff,
          ]}
        >
          <Text style={styles.badgeText}>
            {item.TrangThai ? "Hoạt động" : "Kết thúc"}
          </Text>
        </View>
      </View>

      <View style={styles.row}>
        <TouchableOpacity
          onPress={() => {
            setEditItem(item);
            setTenMon(item.TenMonHoc);
            setTrangThai(item.TrangThai);
            setModal(true);
          }}
        >
          <Text style={{ color: "orange", fontWeight: "600" }}>Sửa</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleDelete(item.MaMonHoc)}>
          <Text style={{ color: "red", fontWeight: "600" }}>Xóa</Text>
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

        <TouchableOpacity style={styles.addBtn} onPress={() => setModal(true)}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>+ Thêm môn</Text>
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

        {/* ================= MODAL FIX ================= */}
        <Modal visible={modal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ width: "100%" }}
            >
              <ScrollView
                contentContainerStyle={styles.modalContainer}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.modalBox}>
                  <Text style={styles.title}>
                    {editItem ? "Sửa môn học" : "Thêm môn học"}
                  </Text>

                  <TextInput
                    placeholder="Tên môn học"
                    value={tenMon}
                    onChangeText={setTenMon}
                    style={styles.input}
                  />

                  {/* STATUS */}
                  <View style={styles.statusRow}>
                    <TouchableOpacity
                      style={[
                        styles.statusBtn,
                        trangThai && styles.statusActive,
                      ]}
                      onPress={() => setTrangThai(true)}
                    >
                      <Text style={styles.statusText}>Hoạt động</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.statusBtn,
                        !trangThai && styles.statusInactive,
                      ]}
                      onPress={() => setTrangThai(false)}
                    >
                      <Text style={styles.statusText}>Kết thúc</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity style={styles.btn} onPress={handleSave}>
                    <Text style={{ color: "#fff", fontWeight: "700" }}>
                      Lưu
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setModal(false)}>
                    <Text style={{ textAlign: "center", marginTop: 10 }}>
                      Đóng
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
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
    borderRadius: 10,
    marginBottom: 10,
    borderColor: "#ddd",
  },

  addBtn: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontWeight: "bold",
    fontSize: 16,
    flex: 1,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  badgeOn: {
    backgroundColor: "#dcfce7",
  },

  badgeOff: {
    backgroundColor: "#fee2e2",
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    borderColor: "#ddd",
  },

  btn: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  /* MODAL FIX */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalBox: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },

  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  statusBtn: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },

  statusActive: {
    backgroundColor: "#dcfce7",
    borderColor: "#22c55e",
  },

  statusInactive: {
    backgroundColor: "#fee2e2",
    borderColor: "#ef4444",
  },

  statusText: {
    fontWeight: "600",
  },
});