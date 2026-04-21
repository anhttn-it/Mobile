import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { getLichSuDetail } from "../../api/lichsu";

export default function LichSuDetailScreen({ route, navigation }) {
  const { maKetQua } = route.params;
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getLichSuDetail(maKetQua);
        setData(res);
      } catch (err) {
        console.log(err);
      }
    };
    load();
  }, []);

  if (!data) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 10 }}>Đang tải kết quả...</Text>
      </SafeAreaView>
    );
  }

  const { ketQua, cauHoi } = data;

  const percent =
    ketQua.Tong > 0
      ? Math.round((ketQua.SoCauDung / ketQua.Tong) * 100)
      : 0;

  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Quay lại</Text>
        </TouchableOpacity>

        <Text style={styles.title}>📊 Kết quả chi tiết</Text>

        <View style={{ width: 70 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* SUMMARY */}
        <View style={styles.summaryCard}>
          <Text style={styles.score}>🎯 {ketQua.DiemThi} điểm</Text>

          <Text style={styles.stat}>
            ✔ Đúng: {ketQua.SoCauDung}/{ketQua.Tong}
          </Text>

          <View style={styles.percentBox}>
            <Text style={styles.percentText}>
              {percent}% chính xác
            </Text>
          </View>
        </View>

        {/* QUESTIONS */}
        {cauHoi.map((q, i) => (
          <View key={i} style={styles.card}>

            <Text style={styles.question}>
              Câu {i + 1}: {q.CauHoi}
            </Text>

            {q.DapAns.map((a) => {
              const isSelected = a.MaCauTraLoi === q.DapAnChon;
              const isCorrect = a.LaDapAn;

              return (
                <View
                  key={a.MaCauTraLoi}
                  style={[
                    styles.option,
                    isCorrect && styles.correct,
                    isSelected && !isCorrect && styles.wrong,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      (isCorrect || (isSelected && !isCorrect)) && {
                        color: "#fff",
                        fontWeight: "bold",
                      },
                    ]}
                  >
                    {a.NoiDungTraLoi}
                  </Text>
                </View>
              );
            })}

          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f9",
    paddingHorizontal: 15,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    marginBottom: 10,
  },

  back: {
    color: "#2196F3",
    fontWeight: "bold",
    fontSize: 14,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
  },

  // SUMMARY
  summaryCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
  },

  score: {
    fontSize: 18,
    fontWeight: "bold",
  },

  stat: {
    marginTop: 5,
    color: "#555",
  },

  percentBox: {
    marginTop: 10,
    backgroundColor: "#2196F3",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
  },

  percentText: {
    color: "#fff",
    fontWeight: "bold",
  },

  // QUESTION CARD
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },

  question: {
    fontWeight: "bold",
    marginBottom: 10,
  },

  option: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#eee",
    marginTop: 6,
  },

  correct: {
    backgroundColor: "#2ecc71",
  },

  wrong: {
    backgroundColor: "#e74c3c",
  },

  optionText: {
    color: "#333",
  },
});