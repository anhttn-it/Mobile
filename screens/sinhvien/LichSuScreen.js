import React, {
  useEffect,
  useState,
  useContext,
} from "react";

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import { AuthContext }
from "../../context/AuthContext";

import { getLichSu }
from "../../api/lichsu";

export default function LichSuScreen({
  navigation,
}) {
  const { user } =
    useContext(AuthContext);

  const [data, setData] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const load = async () => {
    try {
      setLoading(true);

      const res =
        await getLichSu(
          user.userId
        );

      setData(res || []);
    } catch (err) {
      console.log(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // ===== SEARCH FILTER =====
  const filtered =
    data.filter((x) =>
      x.TenDe
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  // ===== LOADING =====
  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator
          size="large"
          color="#2563eb"
        />

        <Text style={styles.loadingText}>
          Đang tải lịch sử...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={styles.container}
    >
      <StatusBar
        barStyle="light-content"
      />

      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            navigation.goBack()
          }
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>
            ‹
          </Text>
        </TouchableOpacity>

        <View>
          <Text style={styles.title}>
            Lịch sử làm bài
          </Text>

          <Text style={styles.subtitle}>
            {filtered.length} bài đã làm
          </Text>
        </View>
      </View>

      {/* ===== SEARCH ===== */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>
          🔍
        </Text>

        <TextInput
          placeholder="Tìm kiếm tên đề thi..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />

        {search.length > 0 && (
          <TouchableOpacity
            onPress={() =>
              setSearch("")
            }
          >
            <Text
              style={styles.clearText}
            >
              ✕
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ===== LIST ===== */}
      <FlatList
        data={filtered}
        showsVerticalScrollIndicator={false}
        keyExtractor={(i) =>
          i.MaKetQua.toString()
        }
        contentContainerStyle={{
          paddingBottom: 20,
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>
              📭
            </Text>

            <Text style={styles.emptyTitle}>
              Không tìm thấy đề thi
            </Text>

            <Text style={styles.emptyText}>
              Hãy thử tìm kiếm bằng
              từ khóa khác
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate(
                "LichSuDetail",
                {
                  maKetQua:
                    item.MaKetQua,
                }
              )
            }
          >
            {/* TOP */}
            <View
              style={styles.cardTop}
            >
              <View
                style={styles.iconBox}
              >
                <Text
                  style={styles.bookIcon}
                >
                  📘
                </Text>
              </View>

              <View
                style={{ flex: 1 }}
              >
                <Text
                  style={styles.titleCard}
                  numberOfLines={2}
                >
                  {item.TenDe}
                </Text>

                <Text
                  style={styles.time}
                >
                  🕒{" "}
                  {new Date(
                    item.ThoiGianVaoThi
                  ).toLocaleString()}
                </Text>
              </View>

              {/* SCORE */}
              <View
                style={styles.scoreBox}
              >
                <Text
                  style={styles.scoreText}
                >
                  {item.DiemThi}
                </Text>
              </View>
            </View>

            {/* INFO */}
            <View
              style={styles.infoRow}
            >
              <View
                style={styles.infoItem}
              >
                <Text
                  style={styles.infoLabel}
                >
                  Đúng
                </Text>

                <Text
                  style={styles.infoValue}
                >
                  {
                    item.SoCauDung
                  }
                  /
                  {
                    item.TongCau
                  }
                </Text>
              </View>

              <View
                style={styles.divider}
              />

              <View
                style={styles.infoItem}
              >
                <Text
                  style={styles.infoLabel}
                >
                  Điểm
                </Text>

                <Text
                  style={styles.infoValue}
                >
                  {item.DiemThi}
                </Text>
              </View>
            </View>

            {/* BUTTON */}
            <TouchableOpacity
              style={styles.detailBtn}
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate(
                  "LichSuDetail",
                  {
                    maKetQua:
                      item.MaKetQua,
                  }
                )
              }
            >
              <Text
                style={styles.detailText}
              >
                Xem chi tiết
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      "#eef3f8",
    paddingHorizontal: 14,
  },

  // ===== LOADING =====
  loadingBox: {
    flex: 1,
    justifyContent:
      "center",
    alignItems: "center",
    backgroundColor:
      "#eef3f8",
  },

  loadingText: {
    marginTop: 12,
    color: "#6b7280",
    fontSize: 15,
  },

  // ===== HEADER =====
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 18,
  },

  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#fff",
    justifyContent:
      "center",
    alignItems: "center",
    marginRight: 12,

    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },

  backIcon: {
    fontSize: 28,
    color: "#2563eb",
    marginTop: -3,
    fontWeight: "bold",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },

  subtitle: {
    marginTop: 2,
    color: "#6b7280",
    fontSize: 14,
  },

  // ===== SEARCH =====
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 56,
    marginBottom: 16,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 3,
  },

  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
  },

  clearText: {
    fontSize: 18,
    color: "#9ca3af",
    paddingLeft: 8,
  },

  // ===== CARD =====
  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 7,
    elevation: 4,
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBox: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor:
      "#dbeafe",
    justifyContent:
      "center",
    alignItems: "center",
    marginRight: 14,
  },

  bookIcon: {
    fontSize: 28,
  },

  titleCard: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 5,
    paddingRight: 10,
  },

  time: {
    fontSize: 13,
    color: "#6b7280",
  },

  // ===== SCORE =====
  scoreBox: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor:
      "#eff6ff",
    justifyContent:
      "center",
    alignItems: "center",
  },

  scoreText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2563eb",
  },

  // ===== INFO =====
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-around",
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor:
      "#f3f4f6",
  },

  infoItem: {
    alignItems: "center",
    flex: 1,
  },

  infoLabel: {
    fontSize: 13,
    color: "#9ca3af",
  },

  infoValue: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },

  divider: {
    width: 1,
    height: 36,
    backgroundColor:
      "#e5e7eb",
  },

  // ===== BUTTON =====
  detailBtn: {
    marginTop: 16,
    backgroundColor:
      "#2563eb",
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
  },

  detailText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },

  // ===== EMPTY =====
  emptyBox: {
    marginTop: 80,
    alignItems: "center",
  },

  emptyIcon: {
    fontSize: 52,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },

  emptyText: {
    marginTop: 6,
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
});