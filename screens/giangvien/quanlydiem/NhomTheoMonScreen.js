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

import MainLayout from "../../../components/MainLayout";

import { getNhomTheoMon } from "../../../api/quanlydiem";

export default function NhomTheoMonScreen({ navigation, route }) {
  const { maMonHoc, tenMonHoc, userId } = route.params;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const res = await getNhomTheoMon(userId, maMonHoc);

      console.log("NHOM RESPONSE:", res);

      if (Array.isArray(res)) {
        setData(res);
      } else if (Array.isArray(res?.data)) {
        setData(res.data);
      } else {
        setData([]);
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
    <MainLayout title={tenMonHoc} navigation={navigation}>
      
      {/* ================= BACK BUTTON ================= */}
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
        data={data}
        keyExtractor={(item) => item.MaNhom.toString()}
        contentContainerStyle={{ padding: 10, paddingTop: 0 }}
        ListEmptyComponent={
          <Text style={styles.empty}>Không có nhóm</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate("BangDiem", {
                maNhom: item.MaNhom,
                tenNhom: item.TenNhom,
                userId,
              })
            }
          >
            <View style={styles.iconBox}>
              <Text style={styles.icon}>👥</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.TenNhom}</Text>

              <Text style={styles.subtitle}>
                Sĩ số: {item.SiSo || 0}
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

  // ===== BACK BUTTON HEADER =====
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
    backgroundColor: "#dcfce7",
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