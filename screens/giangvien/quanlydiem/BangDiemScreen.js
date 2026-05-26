import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Share,
} from "react-native";

import MainLayout from "../../../components/MainLayout";

import { getDanhSachDe } from "../../../api/quanlydiem";

export default function BangDiemScreen({ route, navigation }) {
  const { maNhom, tenNhom } = route.params;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const res = await getDanhSachDe(maNhom);

      if (Array.isArray(res)) {
        setData(res);
      } else if (Array.isArray(res?.data)) {
        setData(res.data);
      } else {
        setData([]);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      if (!data || data.length === 0) return;

      const header = "MaDe,TenDe,ThoiGianThi,SoCau\n";

      const body = data
        .map((item) => {
          const soCau =
            (item.SoCauDe || 0) +
            (item.SoCauTrungBinh || 0) +
            (item.SoCauKho || 0);

          return `${item.MaDe},${item.TenDe},${item.ThoiGianThi},${soCau}`;
        })
        .join("\n");

      await Share.share({
        message: header + body,
        title: "Export Bảng Điểm",
      });
    } catch (err) {
      console.log(err);
    }
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate("ChartDiem", {
            maDe: item.MaDe,
            maNhom,
            tenDe: item.TenDe,
          })
        }
      >
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {item.TenDe}
          </Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>#{item.MaDe}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>⏱ Thời gian:</Text>
          <Text style={styles.value}>{item.ThoiGianThi} phút</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>📝 Số câu:</Text>
          <Text style={styles.value}>
            {(item.SoCauDe || 0) +
              (item.SoCauTrungBinh || 0) +
              (item.SoCauKho || 0)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>📅 Bắt đầu:</Text>
          <Text style={styles.value} numberOfLines={1}>
            {item.ThoiGianBatDau
              ? new Date(item.ThoiGianBatDau).toLocaleString()
              : "---"}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.viewText}>Xem bảng điểm →</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <MainLayout title={tenNhom || "Danh sách đề thi"} navigation={navigation}>
      
      {/* ================= BACK BUTTON (NEW) ================= */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>

        <View style={{ marginBottom: 10, alignItems: "flex-end" }}>
          <TouchableOpacity onPress={handleExport} style={styles.exportBtn}>
            <Text style={styles.exportText}>Export dữ liệu</Text>
          </TouchableOpacity>
        </View>
      </View>

      {data.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Không có đề thi</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.MaDe.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 12,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // ===== BACK HEADER =====
  headerRow: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#fff",
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

  exportBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },

  exportText: {
    color: "#fff",
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginRight: 10,
  },

  badge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },

  badgeText: {
    color: "#2563eb",
    fontWeight: "700",
    fontSize: 12,
  },

  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },

  label: {
    width: 110,
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "600",
  },

  value: {
    flex: 1,
    color: "#111827",
    fontSize: 14,
  },

  footer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    alignItems: "flex-end",
  },

  viewText: {
    color: "#2563eb",
    fontWeight: "700",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    fontSize: 16,
    color: "#6b7280",
  },
});