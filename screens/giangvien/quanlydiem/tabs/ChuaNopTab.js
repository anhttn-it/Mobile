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
  getChuaNop,
} from "../../../../api/quanlydiem";

export default function ChuaNopTab({
  maDe,
  maNhom,
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
          await getChuaNop(
            maDe,
            maNhom
          );

        console.log(
          "CHUA NOP:",
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
            styles.avatar
          }
        >
          <Text
            style={
              styles.avatarText
            }
          >
            {index + 1}
          </Text>
        </View>

        <View
          style={{
            flex: 1,
          }}
        >
          <Text
            style={
              styles.name
            }
          >
            {
              item.HoTen
            }
          </Text>

          <Text
            style={
              styles.email
            }
          >
            {
              item.Email
            }
          </Text>
        </View>

        <View
          style={
            styles.statusBox
          }
        >
          <Text
            style={
              styles.status
            }
          >
            Chưa
            nộp
          </Text>
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
            Tất cả
            sinh viên
            đã nộp bài
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(
            item,
            index
          ) =>
            index.toString()
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
      padding: 14,
      marginBottom: 12,
      elevation: 3,

      shadowColor:
        "#000",

      shadowOpacity: 0.08,

      shadowRadius: 4,

      shadowOffset: {
        width: 0,
        height: 2,
      },

      flexDirection: "row",
      alignItems:
        "center",
    },

    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor:
        "#fee2e2",

      justifyContent:
        "center",

      alignItems:
        "center",

      marginRight: 14,
    },

    avatarText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#dc2626",
    },

    name: {
      fontSize: 16,
      fontWeight: "700",
      color: "#111827",
      marginBottom: 4,
    },

    email: {
      color: "#6b7280",
      fontSize: 13,
    },

    statusBox: {
      backgroundColor:
        "#fee2e2",

      paddingHorizontal: 10,

      paddingVertical: 6,

      borderRadius: 20,
    },

    status: {
      color: "#dc2626",
      fontWeight: "700",
      fontSize: 12,
    },
  });