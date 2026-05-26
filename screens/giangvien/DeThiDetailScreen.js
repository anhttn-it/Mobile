import React, {
  useEffect,
  useState,
  useContext,
} from "react";

import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";

import { Linking } from "react-native";

import { getDeThiDetail } from "../../api/dethi";

import { AuthContext } from "../../context/AuthContext";

export default function DeThiDetailScreen({
  route,
  navigation,
}) {
  const { id } = route.params;

  const { user } = useContext(AuthContext);

  const [data, setData] = useState(null);

  const [loading, setLoading] =
    useState(true);

  // ================= LOAD DATA =================
  const load = async () => {
    try {
      setLoading(true);

      const res = await getDeThiDetail(
        id,
        user.userId
      );

      console.log("DETAIL:", res);

      setData(res);
    } catch (err) {
      console.log(
        "❌ DETAIL ERROR:",
        err.message
      );

      Alert.alert(
        "Lỗi",
        err.message ||
          "Không tải được đề thi"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.userId) {
      load();
    }
  }, [user]);

  // ================= LOADING =================
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={{ marginTop: 10 }}>
          Đang tải đề thi...
        </Text>
      </View>
    );
  }

  // ================= NO DATA =================
  if (!data) {
    return (
      <View style={styles.center}>
        <Text>Không có dữ liệu</Text>
      </View>
    );
  }

  // ================= UI =================
  return (
    <View style={styles.container}>
      {/* ===== TOP BAR ===== */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() =>
            navigation.goBack()
          }
        >
          <Text style={styles.back}>
            ← Quay lại
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
  style={styles.startBtn}
onPress={() => {
  const url =
    `https://glare-legwork-snooper.ngrok-free.dev/Pdf/Export?maDe=${data.MaDe}`;

  Linking.openURL(url);
}}
>
  <Text style={styles.startText}>
    Xuất PDF
  </Text>
</TouchableOpacity>
      </View>

      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <Text style={styles.title}>
          📘 {data.TenDe}
        </Text>

        <Text style={styles.info}>
          📚 Môn học:{" "}
          {data.TenMonHoc}
        </Text>

        {data.TenNhom && (
          <Text style={styles.info}>
            👥 Nhóm: {data.TenNhom}
          </Text>
        )}

        <Text style={styles.info}>
          ⏱ Thời gian thi:{" "}
          {data.ThoiGianThi} phút
        </Text>

        <Text style={styles.info}>
          📝 Tổng số câu:
          {" "}
          {data.SoCauDe +
            data.SoCauTrungBinh +
            data.SoCauKho}
        </Text>

        <View style={styles.badgeRow}>
          <Text style={styles.badge}>
            Dễ: {data.SoCauDe}
          </Text>

          <Text style={styles.badge}>
            TB:{" "}
            {data.SoCauTrungBinh}
          </Text>

          <Text style={styles.badge}>
            Khó: {data.SoCauKho}
          </Text>
        </View>
      </View>

      {/* ===== LIST CÂU HỎI ===== */}
      <FlatList
        data={data.CauHoi}
        keyExtractor={(item) =>
          item.MaCauHoi.toString()
        }
        contentContainerStyle={{
          paddingBottom: 30,
        }}
        showsVerticalScrollIndicator={
          false
        }
        renderItem={({
          item,
          index,
        }) => (
          <View style={styles.card}>
            {/* ===== CÂU HỎI ===== */}
            <Text style={styles.question}>
              Câu {index + 1}:{" "}
              {item.NoiDung}
            </Text>

            {/* ===== ĐỘ KHÓ ===== */}
            <Text style={styles.level}>
              Độ khó:
              {" "}
              {item.DoKho === 1
                ? " Dễ"
                : item.DoKho === 2
                ? " Trung bình"
                : " Khó"}
            </Text>

            {/* ===== ĐÁP ÁN ===== */}
            {item.DapAns?.map(
              (a, i) => (
                <View
                  key={i}
                  style={[
                    styles.answer,
                    a.LaDapAn &&
                      styles.correctAnswer,
                  ]}
                >
                  <Text
                    style={[
                      styles.answerText,
                      a.LaDapAn &&
                        styles.correctText,
                    ]}
                  >
                    {String.fromCharCode(
                      65 + i
                    )}
                    .{" "}
                    {
                      a.NoiDungTraLoi
                    }
                  </Text>
                </View>
              )
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // ===== CONTAINER =====
  container: {
    flex: 1,
    backgroundColor: "#f2f4f8",
    paddingHorizontal: 15,
    paddingTop: 40,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // ===== TOP BAR =====
  topBar: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  back: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2196F3",
  },

  startBtn: {
    backgroundColor: "#2ecc71",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },

  startText: {
    color: "#fff",
    fontWeight: "bold",
  },

  // ===== HEADER =====
  header: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 16,
    marginBottom: 15,
    elevation: 3,
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#222",
  },

  info: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
  },

  badgeRow: {
    flexDirection: "row",
    marginTop: 10,
  },

  badge: {
    backgroundColor: "#2196F3",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 8,
    fontSize: 12,
    overflow: "hidden",
  },

  // ===== CARD =====
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
  },

  question: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 10,
  },

  level: {
    marginBottom: 10,
    color: "#666",
    fontStyle: "italic",
  },

  // ===== ANSWER =====
  answer: {
    backgroundColor: "#f8f9fa",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 8,
  },

  answerText: {
    color: "#333",
    fontSize: 14,
  },

  // ===== CORRECT =====
  correctAnswer: {
    backgroundColor: "#d4edda",
    borderWidth: 1,
    borderColor: "#28a745",
  },

  correctText: {
    color: "#155724",
    fontWeight: "bold",
  },
});