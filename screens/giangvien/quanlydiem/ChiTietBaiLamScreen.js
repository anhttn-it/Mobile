import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import MainLayout
from "../../../components/MainLayout";

import {
  getChiTietBaiLam,
} from "../../../api/quanlydiem";

export default function ChiTietBaiLamScreen({
  route,
  navigation,
}) {
  const { maKetQua } =
    route.params;

  const [data, setData] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const res =
        await getChiTietBaiLam(
          maKetQua
        );

      console.log(
        "CHI TIET BAI LAM:",
        res
      );

      if (Array.isArray(res)) {
        setData(res);
      } else if (
        Array.isArray(res?.data)
      ) {
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

  const renderAnswer = (
    answer,
    selected
  ) => {
    const isSelected =
      selected ==
      answer.MaCauTraLoi;

    const isCorrect =
      answer.LaDapAn;

    return (
      <View
        key={answer.MaCauTraLoi}
        style={[
          styles.answerBox,

          isCorrect &&
            styles.correctAnswer,

          isSelected &&
            !isCorrect &&
            styles.wrongAnswer,
        ]}
      >
        <Text
          style={
            styles.answerText
          }
        >
          {answer.NoiDung}
        </Text>

        {isCorrect && (
          <Text
            style={
              styles.correctLabel
            }
          >
            ✓ Đáp án đúng
          </Text>
        )}

        {isSelected &&
          !isCorrect && (
            <Text
              style={
                styles.wrongLabel
              }
            >
              ✕ Đã chọn
            </Text>
          )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#2563eb"
        />
      </View>
    );
  }

  return (
    <MainLayout
      title="Chi tiết bài làm"
      navigation={navigation}
    >
      <View style={styles.container}>
        <FlatList
          data={data}
          keyExtractor={(
            item,
            index
          ) => index.toString()}
          showsVerticalScrollIndicator={
            false
          }
          ListEmptyComponent={
            <View
              style={styles.emptyBox}
            >
              <Text
                style={
                  styles.emptyText
                }
              >
                Không có dữ liệu
              </Text>
            </View>
          }
          renderItem={({
            item,
            index,
          }) => (
            <View
              style={styles.card}
            >
              <View
                style={
                  styles.questionHeader
                }
              >
                <Text
                  style={
                    styles.questionIndex
                  }
                >
                  Câu {index + 1}
                </Text>
              </View>

              <Text
                style={
                  styles.questionText
                }
              >
                {item.NoiDung}
              </Text>

              <View
                style={
                  styles.answerContainer
                }
              >
                {item.DapAns?.map(
                  (da) =>
                    renderAnswer(
                      da,
                      item.DapAnChon
                    )
                )}
              </View>
            </View>
          )}
        />
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      "#f3f4f6",
    padding: 12,
  },

  center: {
    flex: 1,
    justifyContent:
      "center",
    alignItems: "center",
    backgroundColor:
      "#f3f4f6",
  },

  card: {
    backgroundColor:
      "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  questionHeader: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  questionIndex: {
    backgroundColor:
      "#2563eb",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontWeight: "bold",
    fontSize: 13,
  },

  questionText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 24,
  },

  answerContainer: {
    marginTop: 16,
  },

  answerBox: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    backgroundColor:
      "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  answerText: {
    fontSize: 15,
    color: "#111827",
    lineHeight: 22,
  },

  correctAnswer: {
    backgroundColor:
      "#dcfce7",
    borderColor: "#22c55e",
  },

  wrongAnswer: {
    backgroundColor:
      "#fee2e2",
    borderColor: "#ef4444",
  },

  correctLabel: {
    marginTop: 8,
    color: "#16a34a",
    fontWeight: "700",
    fontSize: 13,
  },

  wrongLabel: {
    marginTop: 8,
    color: "#dc2626",
    fontWeight: "700",
    fontSize: 13,
  },

  emptyBox: {
    marginTop: 40,
    alignItems: "center",
  },

  emptyText: {
    fontSize: 16,
    color: "#6b7280",
  },
});