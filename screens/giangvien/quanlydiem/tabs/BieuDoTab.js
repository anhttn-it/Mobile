import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Dimensions,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import {
  PieChart,
} from "react-native-chart-kit";

import {
  getThongKeDiem,
} from "../../../../api/quanlydiem";

const COLORS = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
];

export default function BieuDoTab({
  maDe,
}) {
  const [data, setData] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData =
    async () => {
      try {
        setLoading(true);

        const res =
          await getThongKeDiem(
            maDe
          );

        console.log(
          "THONG KE DIEM:",
          res
        );

        const raw =
          Array.isArray(
            res
          )
            ? res
            : res?.data ||
              [];

        const chartData =
          raw.map(
            (
              x,
              index
            ) => ({
              name:
                x.label,
              population:
                x.value,
              color:
                COLORS[
                  index %
                    COLORS.length
                ],
              legendFontColor:
                "#374151",
              legendFontSize: 13,
            })
          );

        setData(
          chartData
        );
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(
          false
        );
      }
    };

  if (loading) {
    return (
      <View
        style={
          styles.center
        }
      >
        <ActivityIndicator
          size="large"
          color="#2563eb"
        />
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View
        style={
          styles.center
        }
      >
        <Text
          style={
            styles.empty
          }
        >
          Không có dữ
          liệu thống
          kê
        </Text>
      </View>
    );
  }

  return (
    <View
      style={
        styles.container
      }
    >
      <Text
        style={
          styles.title
        }
      >
        Thống kê phổ
        điểm
      </Text>

      <View
        style={
          styles.chartBox
        }
      >
        <PieChart
          data={data}
          width={
            Dimensions.get(
              "window"
            ).width - 40
          }
          height={240}
          accessor={
            "population"
          }
          backgroundColor={
            "transparent"
          }
          paddingLeft={
            "10"
          }
          absolute
          hasLegend={
            true
          }
          chartConfig={{
            decimalPlaces: 0,
            color: () =>
              "#000",
          }}
        />
      </View>

      <View
        style={
          styles.noteBox
        }
      >
        <Text
          style={
            styles.note
          }
        >
          • 0-5:
          Yếu
        </Text>

        <Text
          style={
            styles.note
          }
        >
          • 5-7:
          Trung bình
        </Text>

        <Text
          style={
            styles.note
          }
        >
          • 7-8:
          Khá
        </Text>

        <Text
          style={
            styles.note
          }
        >
          • 8-10:
          Giỏi
        </Text>
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#f3f4f6",
      padding: 16,
      alignItems:
        "center",
    },

    center: {
      flex: 1,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    empty: {
      fontSize: 16,
      color: "#6b7280",
    },

    title: {
      fontSize: 20,
      fontWeight: "700",
      color: "#111827",
      marginBottom: 20,
    },

    chartBox: {
      backgroundColor:
        "#fff",
      borderRadius: 20,
      paddingVertical: 20,
      elevation: 3,

      shadowColor:
        "#000",

      shadowOpacity: 0.08,

      shadowRadius: 4,

      shadowOffset: {
        width: 0,
        height: 2,
      },
    },

    noteBox: {
      width: "100%",
      marginTop: 20,
      backgroundColor:
        "#fff",
      borderRadius: 16,
      padding: 16,
      elevation: 2,
    },

    note: {
      fontSize: 15,
      color: "#374151",
      marginBottom: 10,
      fontWeight: "600",
    },
  });