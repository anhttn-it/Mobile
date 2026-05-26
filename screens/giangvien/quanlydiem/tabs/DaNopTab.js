import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Share,
} from "react-native";

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { useNavigation } from "@react-navigation/native";

import { getDaNop } from "../../../../api/quanlydiem";

export default function DaNopTab({ maDe }) {
  const navigation = useNavigation();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const res = await getDaNop(maDe);

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

  // =========================
  // EXPORT PDF (NEW)
  // =========================
  const handleExportPDF = async () => {
    try {
      if (!data || data.length === 0) return;

      const tableRows = data
        .map((item, index) => {
          return `
            <tr>
              <td>${index + 1}</td>
              <td>${item.HoTen}</td>
              <td>${item.Email}</td>
              <td>${item.DiemThi ?? 0}</td>
              <td>${item.ThoiGianLamBai} giây</td>
              <td>${item.SoLanChuyenTab}</td>
            </tr>
          `;
        })
        .join("");

      const html = `
        <html>
          <head>
            <style>
              body {
                font-family: Arial;
                padding: 20px;
              }

              .header {
                text-align: center;
                margin-bottom: 20px;
              }

              .logo {
                width: 80px;
                height: 80px;
                margin-bottom: 10px;
              }

              h1 {
                margin: 0;
                font-size: 20px;
                color: #2563eb;
              }

              h2 {
                margin: 5px 0 20px;
                font-size: 16px;
                color: #374151;
              }

              table {
                width: 100%;
                border-collapse: collapse;
              }

              th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: center;
                font-size: 12px;
              }

              th {
                background-color: #2563eb;
                color: white;
              }

              tr:nth-child(even) {
                background-color: #f3f4f6;
              }
            </style>
          </head>

          <body>
            <div class="header">
              <img class="logo" src="https://cdn-icons-png.flaticon.com/512/3135/3135755.png" />
              <h1>BẢNG ĐIỂM BÀI THI</h1>
              <h2>Mã đề: ${maDe}</h2>
            </div>

            <table>
              <tr>
                <th>#</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Điểm</th>
                <th>Thời gian làm</th>
                <th>Chuyển tab</th>
              </tr>
              ${tableRows}
            </table>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });

      await Sharing.shareAsync(uri);
    } catch (err) {
      console.log("EXPORT PDF ERROR:", err);
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.HoTen}</Text>
            <Text style={styles.email}>{item.Email}</Text>
          </View>

          <View style={styles.scoreBox}>
            <Text style={styles.score}>{item.DiemThi ?? 0}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>⏱ Thời gian làm:</Text>
          <Text style={styles.value}>
            {item.ThoiGianLamBai} giây
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>🔄 Chuyển tab:</Text>
          <Text style={styles.value}>{item.SoLanChuyenTab}</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate("ChiTietBaiLam", {
              maKetQua: item.MaKetQua,
            })
          }
        >
          <Text style={styles.buttonText}>Xem chi tiết bài làm</Text>
        </TouchableOpacity>
      </View>
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
    <View style={styles.container}>
      {/* EXPORT PDF BUTTON */}
      <View style={{ marginBottom: 10, alignItems: "flex-end" }}>
        <TouchableOpacity onPress={handleExportPDF} style={styles.exportBtn}>
          <Text style={styles.exportText}>Export PDF</Text>
        </TouchableOpacity>
      </View>

      {data.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>Chưa có sinh viên nộp bài</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.MaKetQua.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
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

  empty: {
    fontSize: 16,
    color: "#6b7280",
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
    alignItems: "center",
    marginBottom: 14,
  },

  name: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },

  email: {
    color: "#6b7280",
    fontSize: 13,
  },

  scoreBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
  },

  score: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2563eb",
  },

  infoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },

  label: {
    width: 130,
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "600",
  },

  value: {
    flex: 1,
    color: "#111827",
    fontSize: 14,
  },

  button: {
    marginTop: 14,
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 10,
  },

  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
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
});