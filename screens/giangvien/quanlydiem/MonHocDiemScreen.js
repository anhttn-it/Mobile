import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import MainLayout from "../../../components/MainLayout";

import { getMonHocDiem } from "../../../api/quanlydiem";

export default function MonHocDiemScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [monHoc, setMonHoc] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      setLoading(true);

      const raw = await AsyncStorage.getItem("user");

      if (!raw) throw new Error("Chưa đăng nhập");

      const user = JSON.parse(raw);

      const uid =
        user?.userId ||
        user?.UserId ||
        user?.Id ||
        user?.id;

      if (!uid) throw new Error("Không tìm thấy userId");

      setUserId(uid);

      const res = await getMonHocDiem(uid);

      if (Array.isArray(res)) {
        setMonHoc(res);
      } else if (Array.isArray(res?.data)) {
        setMonHoc(res.data);
      } else {
        setMonHoc([]);
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Lỗi", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <MainLayout title="Quản lý điểm" navigation={navigation}>
      
      {/* ================= BACK BUTTON (FIXED) ================= */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={monHoc}
        keyExtractor={(item) => item.MaMonHoc.toString()}
        contentContainerStyle={{ padding: 10, paddingTop: 0 }}
        ListEmptyComponent={
          <Text style={styles.empty}>Không có môn học</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate("NhomTheoMon", {
                userId,
                maMonHoc: item.MaMonHoc,
                tenMonHoc: item.TenMonHoc,
              })
            }
          >
            <View style={styles.iconBox}>
              <Text style={styles.icon}>📘</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.TenMonHoc}</Text>
              <Text style={styles.subtitle}>
                Mã môn: {item.MaMonHoc}
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        )}
      />
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  empty: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#666",
  },

  // ===== NEW HEADER ROW (SPACE FIX) =====
  headerRow: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 5,
  },

  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },

  backIcon: {
    fontSize: 26,
    color: "#2563eb",
    fontWeight: "bold",
    marginTop: -2,
  },

  card: {
    backgroundColor: "#fff",
    marginBottom: 14,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },

  iconBox: {
    width: 55,
    height: 55,
    borderRadius: 14,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  icon: {
    fontSize: 28,
  },

  title: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827",
  },

  subtitle: {
    marginTop: 5,
    color: "#6b7280",
    fontSize: 14,
  },

  arrow: {
    fontSize: 28,
    color: "#9ca3af",
    marginLeft: 10,
  },
});