import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import {
  getThongKeCauHoi,
} from "../../../../api/quanlydiem";

export default function CauHoiTab({
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
          await getThongKeCauHoi(
            maDe
          );

        console.log(
          "THONG KE CAU HOI:",
          res
        );

        if (
          Array.isArray(
            res
          )
        ) {
          setData(res);
        } else if (
          Array.isArray(
            res?.data
          )
        ) {
          setData(
            res.data
          );
        } else {
          setData([]);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(
          false
        );
      }
    };

  const getColor = (
    value
  ) => {
    if (value >= 80)
      return "#16a34a";

    if (value >= 50)
      return "#f59e0b";

    return "#dc2626";
  };

  const renderItem = ({
    item,
    index,
  }) => {
    return (
      <View
        style={
          styles.card
        }
      >
        <View
          style={
            styles.top
          }
        >
          <View
            style={
              styles.indexBox
            }
          >
            <Text
              style={
                styles.indexText
              }
            >
              {index + 1}
            </Text>
          </View>

          <Text
            style={
              styles.percent
            }
          >
            {
              item.PhanTram
            }
            %
          </Text>
        </View>

        <Text
          style={
            styles.question
          }
        >
          {
            item.NoiDung
          }
        </Text>

        <View
          style={
            styles.progressBg
          }
        >
          <View
            style={[
              styles.progress,
              {
                width: `${item.PhanTram}%`,
                backgroundColor:
                  getColor(
                    item.PhanTram
                  ),
              },
            ]}
          />
        </View>
      </View>
    );
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

  return (
    <View
      style={
        styles.container
      }
    >
      {data.length ===
      0 ? (
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
            Không có
            dữ liệu
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(
            item
          ) =>
            item.MaCauHoi.toString()
          }
          renderItem={
            renderItem
          }
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={{
            paddingBottom: 20,
          }}
        />
      )}
    </View>
  );
}

const styles =
  StyleSheet.create({
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
      alignItems:
        "center",
    },

    empty: {
      fontSize: 16,
      color: "#6b7280",
    },

    card: {
      backgroundColor:
        "#fff",
      borderRadius: 16,
      padding: 16,
      marginBottom: 14,
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

    top: {
      flexDirection: "row",
      justifyContent:
        "space-between",
      alignItems:
        "center",
      marginBottom: 12,
    },

    indexBox: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor:
        "#dbeafe",

      justifyContent:
        "center",

      alignItems:
        "center",
    },

    indexText: {
      color: "#2563eb",
      fontWeight: "700",
    },

    question: {
      fontSize: 15,
      color: "#111827",
      fontWeight: "600",
      lineHeight: 22,
      marginBottom: 14,
    },

    percent: {
      fontSize: 18,
      fontWeight: "700",
      color: "#2563eb",
    },

    progressBg: {
      height: 10,
      backgroundColor:
        "#e5e7eb",
      borderRadius: 10,
      overflow:
        "hidden",
    },

    progress: {
      height: "100%",
      borderRadius: 10,
    },
  });