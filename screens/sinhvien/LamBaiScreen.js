import React, {
  useEffect,
  useState,
  useContext,
  useRef,
} from "react";

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

import {
  getDeThiDetail,
  startLamBai,
  nopBai,
} from "../../api/lambai";

export default function LamBaiScreen({
  route,
  navigation,
}) {
  const { user } =
    useContext(AuthContext);

  // FIX LỖI route undefined
  const examId =
    route?.params?.id;

  const [data, setData] =
    useState(null);

  const [answers, setAnswers] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [maKetQua, setMaKetQua] =
    useState(null);

  const [startTime, setStartTime] =
    useState(null);

  // ===== TIMER =====
  const [timeLeft, setTimeLeft] =
    useState(0);

  const timerRef = useRef(null);

  // ================= LOAD =================
  useEffect(() => {
    init();

    return () => {
      if (timerRef.current) {
        clearInterval(
          timerRef.current
        );
      }
    };
  }, []);

  const init = async () => {
    try {
      setLoading(true);

      if (!user?.userId) {
        Alert.alert(
          "Lỗi",
          "Không tìm thấy user"
        );
        return;
      }

      if (!examId) {
        Alert.alert(
          "Lỗi",
          "Không tìm thấy mã đề"
        );

        navigation.goBack();
        return;
      }

      // 1. START LÀM BÀI
      const startRes =
        await startLamBai(
          examId,
          user.userId
        );

      setMaKetQua(
        startRes?.MaKetQua
      );

      setStartTime(
        startRes?.StartTime
      );

      // 2. LOAD ĐỀ
      const res =
        await getDeThiDetail(
          examId,
          user.userId
        );

      setData(res);

      // ===== TIMER =====
      const totalSeconds =
        (res?.ThoiGianThi ||
          0) * 60;

      setTimeLeft(totalSeconds);
    } catch (err) {
      Alert.alert(
        "Lỗi",
        err?.message ||
          "Không thể tải đề"
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= TIMER =================
  useEffect(() => {
    if (
      loading ||
      timeLeft <= 0
    ) {
      return;
    }

    timerRef.current =
      setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(
              timerRef.current
            );

            Alert.alert(
              "Hết giờ",
              "Bài thi sẽ được nộp tự động"
            );

            submit(true);

            return 0;
          }

          return prev - 1;
        });
      }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(
          timerRef.current
        );
      }
    };
  }, [timeLeft, loading]);

  // ================= FORMAT TIME =================
  const formatTime = (
    seconds
  ) => {
    const mins = Math.floor(
      seconds / 60
    );

    const secs =
      seconds % 60;

    return `${String(mins).padStart(
      2,
      "0"
    )}:${String(secs).padStart(
      2,
      "0"
    )}`;
  };

  // ================= CHỌN ĐÁP ÁN =================
  const choose = (
    qid,
    aid
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [qid]: aid,
    }));
  };

  // ================= NỘP BÀI =================
  const submit = async (
    auto = false
  ) => {
    try {
      if (!user?.userId)
        return;

      if (!maKetQua) {
        Alert.alert(
          "Lỗi",
          "Không tìm thấy mã kết quả"
        );

        return;
      }

      setSubmitting(true);

      if (timerRef.current) {
        clearInterval(
          timerRef.current
        );
      }

      const payload = {
        MaDe: examId,

        MaKetQua:
          maKetQua,

        UserId:
          user.userId,

        Answers: Object.keys(
          answers
        ).map((q) => ({
          MaCauHoi:
            parseInt(q),

          MaCauTraLoi:
            answers[q],
        })),
      };

      const res =
        await nopBai(
          payload
        );

      if (!auto) {
        Alert.alert(
          "🎉 Kết quả",
          `Điểm: ${res.diem}/${res.tong}\nĐiểm số: ${res.DiemThi}`
        );
      }

      navigation.goBack();
    } catch (err) {
      Alert.alert(
        "Lỗi",
        err?.message ||
          "Không thể nộp bài"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ================= UI LOADING =================
  if (loading) {
    return (
      <SafeAreaView
        style={styles.center}
      >
        <ActivityIndicator
          size="large"
          color="#2196F3"
        />

        <Text
          style={{
            marginTop: 10,
          }}
        >
          Đang tải đề thi...
        </Text>
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView
        style={styles.center}
      >
        <Text>
          Không có dữ liệu
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
    >
      <StatusBar
        barStyle="dark-content"
      />

      <Text style={styles.title}>
        📝 {data.TenDe}
      </Text>

      {/* ===== TIMER ===== */}
      <View style={styles.timerBox}>
        <Text
          style={
            styles.timerLabel
          }
        >
          ⏳ Thời gian còn lại
        </Text>

        <Text
          style={[
            styles.timerText,

            timeLeft <= 60 && {
              color: "#ef4444",
            },
          ]}
        >
          {formatTime(timeLeft)}
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
      >
        {(data.CauHoi || []).map(
          (q, index) => (
            <View
              key={q.MaCauHoi}
              style={styles.card}
            >
              <Text
                style={
                  styles.question
                }
              >
                Câu {index + 1}.{" "}
                {q.NoiDung}
              </Text>

              {(
                q.CauTraLoi ||
                []
              ).map((a) => {
                const selected =
                  answers[
                    q.MaCauHoi
                  ] ===
                  a.MaCauTraLoi;

                return (
                  <TouchableOpacity
                    key={
                      a.MaCauTraLoi
                    }
                    onPress={() =>
                      choose(
                        q.MaCauHoi,
                        a.MaCauTraLoi
                      )
                    }
                    style={[
                      styles.option,

                      selected &&
                        styles.optionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,

                        selected &&
                          styles.optionTextSelected,
                      ]}
                    >
                      {
                        a.NoiDungTraLoi
                      }
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )
        )}

        <TouchableOpacity
          style={[
            styles.submitBtn,

            submitting && {
              opacity: 0.6,
            },
          ]}
          onPress={() =>
            submit(false)
          }
          disabled={submitting}
        >
          <Text
            style={
              styles.submitText
            }
          >
            {submitting
              ? "Đang nộp..."
              : "📤 NỘP BÀI"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ================= STYLE =================
const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#f4f6f9",
      padding: 12,
    },

    center: {
      flex: 1,
      justifyContent:
        "center",
      alignItems: "center",
    },

    title: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 10,
    },

    // ===== TIMER =====
    timerBox: {
      backgroundColor:
        "#fff",
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
      alignItems: "center",
      elevation: 2,
    },

    timerLabel: {
      fontSize: 13,
      color: "#666",
      marginBottom: 4,
    },

    timerText: {
      fontSize: 30,
      fontWeight: "bold",
      color: "#2196F3",
    },

    card: {
      backgroundColor:
        "#fff",
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
      backgroundColor:
        "#eee",
      marginTop: 6,
    },

    optionSelected: {
      backgroundColor:
        "#2ecc71",
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
      backgroundColor:
        "#2196F3",
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