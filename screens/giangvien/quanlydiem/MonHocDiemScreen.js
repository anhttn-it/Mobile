import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import MainLayout from "../../../components/MainLayout";
import { AuthContext } from "../../../context/AuthContext";
import { getMonHoc } from "../../../api/monhoc";

export default function MonHocDiemScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  const [monHoc, setMonHoc] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    load();
  }, [user]);

  // =====================
  // LOAD DATA
  // =====================
  const load = async () => {
    if (!user?.userId) return;

    try {
      setLoading(true);

      // ✅ API đã return data trực tiếp
      const data = await getMonHoc(user.userId);

      setMonHoc(data || []);
    } catch (err) {
      console.log("❌ load môn lỗi:", err);
      setMonHoc([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================
  // REFRESH
  // =====================
  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  // =====================
  // ITEM
  // =====================
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
      <Text style={styles.name}>{item.TenMonHoc}</Text>
      <Text style={styles.sub}>📘 Xem lớp học</Text>
    </TouchableOpacity>
  );

  return (
    <MainLayout title="📊 Chọn môn học" navigation={navigation}>
      <View style={styles.container}>

        {/* LOADING */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" />
            <Text>Đang tải...</Text>
          </View>
        ) : monHoc.length === 0 ? (
          // EMPTY
          <View style={styles.center}>
            <Text style={styles.emptyIcon}>📘</Text>

            <Text style={styles.emptyTitle}>
              Chưa có môn học
            </Text>

            <Text style={styles.emptySub}>
              Bạn cần tạo môn học trước khi tạo lớp
            </Text>

            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => navigation.navigate("MonHoc")}
            >
              <Text style={styles.createText}>
                ➕ Tạo môn học
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          // LIST
          <FlatList
            data={monHoc}
            keyExtractor={(item) => item.MaMonHoc.toString()}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}

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
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 3,
  },

  name: {
    fontSize: 16,
    fontWeight: "bold",
  },

  sub: {
    color: "#888",
    marginTop: 5,
  },

  emptyIcon: {
    fontSize: 50,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },

  emptySub: {
    color: "#777",
    marginTop: 5,
    marginBottom: 20,
    textAlign: "center",
  },

  createBtn: {
    backgroundColor: "#2f80ed",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },

  createText: {
    color: "#fff",
    fontWeight: "bold",
  },
});