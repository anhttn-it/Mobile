import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";


import { getDeThiDetail } from "../../api/dethi";
import { AuthContext } from "../../context/AuthContext";

export default function DeThiDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const { user } = useContext(AuthContext);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await getDeThiDetail(id, user.userId);
      setData(res);
    } catch (err) {
      console.log("❌ DETAIL ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.userId) load();
  }, [user]);

  // ================= LOADING =================
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Đang tải đề thi...</Text>
      </View>
    );
  }

  // ================= UI =================
  return (
    <View style={styles.container}>
      
      {/* ===== TOP BAR ===== */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Quay lại</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.startBtn}
          onPress={() =>
            navigation.navigate("LamBai", { id: data.MaDe })
          }
        >
          <Text style={{ color: "#fff" }}>Làm bài</Text>
        </TouchableOpacity>
      </View>

      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <Text style={styles.title}>📘 {data.TenDe}</Text>

        <Text style={styles.info}>
          Tổng câu:{" "}
          {data.SoCauDe + data.SoCauTrungBinh + data.SoCauKho}
        </Text>

        <View style={styles.badgeRow}>
          <Text style={styles.badge}>Dễ: {data.SoCauDe}</Text>
          <Text style={styles.badge}>TB: {data.SoCauTrungBinh}</Text>
          <Text style={styles.badge}>Khó: {data.SoCauKho}</Text>
        </View>
      </View>

      {/* ===== LIST ===== */}
      <FlatList
        data={data.cauHoi}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <Text style={styles.question}>
              Câu {index + 1}: {item.NoiDung}
            </Text>

            {item.DapAns?.map((a, i) => (
              <View
                key={i}
                style={[
                  styles.answer,
                  a.LaDapAn && styles.correctAnswer, // highlight đáp án đúng
                ]}
              >
                <Text
                  style={[
                    styles.answerText,
                    a.LaDapAn && styles.correctText,
                  ]}
                >
                  {String.fromCharCode(65 + i)}. {a.NoiDungTraLoi}
                </Text>
              </View>
            ))}
          </View>
        )}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f4f8",
    padding: 15,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // ===== TOP =====
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 10,
  },

  back: {
    color: "#2196F3",
    fontWeight: "bold",
    fontSize: 16,
  },

  startBtn: {
    backgroundColor: "#2ecc71",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },

  // ===== HEADER =====
  header: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 3,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },

  info: {
    color: "#666",
    marginBottom: 5,
  },

  badgeRow: {
    flexDirection: "row",
  },

  badge: {
    backgroundColor: "#2196F3",
    color: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 5,
    fontSize: 12,
  },

  // ===== CARD =====
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },

  question: {
    fontWeight: "bold",
    marginBottom: 10,
    fontSize: 15,
  },

  answer: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 5,
    backgroundColor: "#f8f9fa",
  },

  answerText: {
    color: "#333",
  },

  // highlight đáp án đúng
  correctAnswer: {
    backgroundColor: "#d4edda",
  },

  correctText: {
    color: "#155724",
    fontWeight: "bold",
  },
});