import React, {
  useEffect,
  useState,
  useContext,
} from "react";

import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";

import MainLayout from "../../components/MainLayout";

import { AuthContext } from "../../context/AuthContext";

import {
  getDeThiList,
  deleteDeThi,
} from "../../api/dethi";

export default function DeThiScreen({
  navigation,
}) {
  const { user } =
    useContext(AuthContext);

  const [search, setSearch] =
    useState("");

  const [data, setData] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  // ================= LOAD DATA =================
  const loadData = async () => {
    try {
      if (!user?.userId) return;

      setLoading(true);

      const res =
        await getDeThiList(
          user.userId
        );

      // API mới
      setData(res || []);
    } catch (err) {
      Alert.alert(
        "Lỗi",
        err.message
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= FIRST LOAD =================
  useEffect(() => {
    if (user?.userId) {
      loadData();
    }
  }, [user?.userId]);

  // ================= RELOAD =================
  useEffect(() => {
    const unsubscribe =
      navigation.addListener(
        "focus",
        () => {
          loadData();
        }
      );

    return unsubscribe;
  }, [navigation]);

  // ================= FILTER =================
  const filteredData =
    data.filter((item) =>
      item.TenDe?.toLowerCase().includes(
        search.toLowerCase()
      )
    );

  // ================= DELETE =================
  const handleDelete = (id) => {
    Alert.alert(
      "Xác nhận",
      "Bạn có chắc muốn xóa đề này?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          style: "destructive",

          onPress: async () => {
            try {
              await deleteDeThi(
                id,
                user.userId
              );

              Alert.alert(
                "Thành công",
                "Đã xóa đề thi"
              );

              loadData();
            } catch (err) {
              Alert.alert(
                "Lỗi",
                err.message
              );
            }
          },
        },
      ]
    );
  };

  // ================= RENDER ITEM =================
  const renderItem = ({
    item,
  }) => {
    const tongCau =
      (item.SoCauDe || 0) +
      (item.SoCauTrungBinh || 0) +
      (item.SoCauKho || 0);

    return (
      <View style={styles.card}>
        {/* TITLE */}
        <Text style={styles.title}>
          📘 {item.TenDe}
        </Text>

        {/* INFO */}
        <Text style={styles.info}>
          Tổng số câu: {tongCau}
        </Text>

        <Text style={styles.info}>
          Dễ: {item.SoCauDe || 0}
        </Text>

        <Text style={styles.info}>
          Trung bình:{" "}
          {item.SoCauTrungBinh ||
            0}
        </Text>

        <Text style={styles.info}>
          Khó: {item.SoCauKho || 0}
        </Text>

        <Text style={styles.info}>
          Nhóm:
          {" "}
          {item.TenNhom ||
            "Không thuộc nhóm"}
        </Text>

        {/* ACTION */}
        <View style={styles.row}>
          {/* DETAIL */}
          <TouchableOpacity
            style={styles.detailBtn}
            onPress={() =>
              navigation.navigate(
                "DeThiDetailScreen",
                {
                  id: item.MaDe,
                }
              )
            }
          >
            <Text style={styles.btnText}>
              Chi tiết
            </Text>
          </TouchableOpacity>

          {/* EDIT */}
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() =>
              navigation.navigate(
                "EditDeThiScreen",
                {
                  id: item.MaDe,
                }
              )
            }
          >
            <Text style={styles.btnText}>
              Sửa
            </Text>
          </TouchableOpacity>

          {/* DELETE */}
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() =>
              handleDelete(
                item.MaDe
              )
            }
          >
            <Text style={styles.btnText}>
              Xóa
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text
          style={{
            marginTop: 10,
          }}
        >
          Đang tải dữ liệu...
        </Text>
      </View>
    );
  }

  // ================= UI =================
  return (
    <MainLayout
      title="📘 Đề thi"
      navigation={navigation}
    >
      {/* SEARCH + BUTTON */}
      <View style={styles.topBar}>
        <TextInput
          placeholder="🔍 Tìm kiếm đề thi..."
          value={search}
          onChangeText={setSearch}
          style={styles.search}
        />

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() =>
            navigation.navigate(
              "CreateDeThiScreen"
            )
          }
        >
          <Text
            style={
              styles.addBtnText
            }
          >
            + Tạo
          </Text>
        </TouchableOpacity>
      </View>

      {/* EMPTY */}
      {filteredData.length ===
        0 && (
        <View
          style={styles.empty}
        >
          <Text
            style={
              styles.emptyText
            }
          >
            Không có đề thi
          </Text>
        </View>
      )}

      {/* LIST */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) =>
          item.MaDe.toString()
        }
        renderItem={renderItem}
        contentContainerStyle={{
          paddingBottom: 30,
        }}
        showsVerticalScrollIndicator={
          false
        }
      />
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent:
      "center",
    alignItems: "center",
  },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginTop: 10,
    marginBottom: 5,
  },

  search: {
    flex: 1,
    backgroundColor:
      "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  addBtn: {
    backgroundColor:
      "#2ecc71",
    marginLeft: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },

  addBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },

  card: {
    backgroundColor:
      "#fff",
    marginHorizontal: 10,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,

    elevation: 3,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#222",
  },

  info: {
    color: "#555",
    marginBottom: 4,
  },

  row: {
    flexDirection: "row",
    marginTop: 15,
    justifyContent:
      "space-between",
  },

  detailBtn: {
    flex: 1,
    backgroundColor:
      "#3498db",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 5,
  },

  editBtn: {
    flex: 1,
    backgroundColor:
      "#f39c12",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },

  deleteBtn: {
    flex: 1,
    backgroundColor:
      "#e74c3c",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginLeft: 5,
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },

  empty: {
    alignItems: "center",
    marginTop: 40,
  },

  emptyText: {
    color: "#888",
    fontSize: 16,
  },
});