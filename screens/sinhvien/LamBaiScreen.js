import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import { getDeThiDetail, nopBai } from "../../api/lambai";

export default function LamBaiScreen({ route, navigation }) {
  const { user } = useContext(AuthContext);
  const { id } = route.params;

  const [data, setData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getDeThiDetail(id);
      setData(res);
    } catch (err) {
      Alert.alert("Lỗi", err.message);
    } finally {
      setLoading(false);
    }
  };

  const choose = (qid, aid) => {
    setAnswers((prev) => ({
      ...prev,
      [qid]: aid,
    }));
  };

  const submit = async () => {
    try {
      if (!user?.userId) {
        Alert.alert("Lỗi", "Không tìm thấy user");
        return;
      }

      setSubmitting(true);

      const payload = {
        MaDe: id,
        UserId: user.userId,
        Answers: Object.keys(answers).map((q) => ({
          MaCauHoi: parseInt(q),
          MaCauTraLoi: answers[q],
        })),
      };

      const res = await nopBai(payload);

      Alert.alert(
        "🎉 Kết quả",
        `Điểm: ${res.diem}/${res.tong}`
      );

      navigation.goBack();
    } catch (err) {
      Alert.alert("Lỗi", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 10 }}>Đang tải đề thi...</Text>
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Không có dữ liệu</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <Text style={styles.title}>📝 {data.TenDe}</Text>

      <ScrollView showsVerticalScrollIndicator={false}>

        {(data.CauHoi || []).map((q, index) => (
          <View key={q.MaCauHoi} style={styles.card}>

            <Text style={styles.question}>
              Câu {index + 1}. {q.NoiDung}
            </Text>

            {(q.CauTraLoi || []).map((a) => {
              const selected = answers[q.MaCauHoi] === a.MaCauTraLoi;

              return (
                <TouchableOpacity
                  key={a.MaCauTraLoi}
                  onPress={() => choose(q.MaCauHoi, a.MaCauTraLoi)}
                  style={[
                    styles.option,
                    selected && styles.optionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selected && styles.optionTextSelected,
                    ]}
                  >
                    {a.NoiDungTraLoi}
                  </Text>
                </TouchableOpacity>
              );
            })}

          </View>
        ))}

        <TouchableOpacity
          style={[
            styles.submitBtn,
            submitting && { opacity: 0.6 },
          ]}
          onPress={submit}
          disabled={submitting}
        >
          <Text style={styles.submitText}>
            {submitting ? "Đang nộp..." : "📤 NỘP BÀI"}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f9",
    padding: 12,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },

  question: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 10,
  },

  option: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#eee",
    marginTop: 6,
  },

  optionSelected: {
    backgroundColor: "#2ecc71",
  },

  optionText: {
    color: "#333",
  },

  optionTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },

  submitBtn: {
    marginTop: 20,
    backgroundColor: "#2196F3",
    padding: 14,
    borderRadius: 10,
    marginBottom: 30,
  },

  submitText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});