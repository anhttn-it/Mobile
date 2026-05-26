import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import { AuthContext } from "../../context/AuthContext";
import {
  getMyGroups,
  leaveGroup,
  getGroupId,
  getGroupName,
  getGroupSubjectName,
  getGroupDisplayName,
  getTeacherName,
  getGroupSize,
} from "../../api/group";

import MainLayoutSV from "../../components/MainLayoutSV";

export default function MyGroupsScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  // ====================
  // LẤY MÃ SINH VIÊN / USER ID
  // ====================
  const getCurrentUserId = () => {
    return (
      user?.userId ||
      user?.UserId ||
      user?.UserID ||
      user?.id ||
      user?.Id ||
      user?.ID ||
      user?.maNguoiDung ||
      user?.MaNguoiDung ||
      user?.nguoiDungId ||
      user?.NguoiDungId ||
      user?.maSinhVien ||
      user?.MaSinhVien ||
      user?.svId ||
      user?.SVId ||
      ""
    );
  };

  // ====================
  // LOAD GROUPS
  // ====================
  const loadGroups = async (keyword = search) => {
    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
      setGroups([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const res = await getMyGroups(currentUserId, keyword);

      if (res.success) {
        setGroups(res.data || res.Data || []);
      } else {
        Alert.alert("Lỗi", res.message || "Không lấy được danh sách nhóm");
      }
    } catch (err) {
      Alert.alert("Lỗi", err.message || "Không thể tải nhóm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      const currentUserId = getCurrentUserId();

      if (currentUserId) {
        loadGroups(search);
      }
    });

    return unsubscribe;
  }, [navigation, user, search]);

  useEffect(() => {
    const currentUserId = getCurrentUserId();

    if (currentUserId) {
      loadGroups("");
    } else {
      setGroups([]);
    }
  }, [user]);

  // ====================
  // REFRESH
  // ====================
  const onRefresh = async () => {
    setRefreshing(true);
    await loadGroups(search);
    setRefreshing(false);
  };

  // ====================
  // SEARCH
  // ====================
  const handleSearch = async (text) => {
    setSearch(text);

    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
      setGroups([]);
      return;
    }

    try {
      const res = await getMyGroups(currentUserId, text);

      if (res.success) {
        setGroups(res.data || res.Data || []);
      } else {
        Alert.alert("Lỗi", res.message || "Không tìm kiếm được nhóm");
      }
    } catch (err) {
      Alert.alert("Lỗi", err.message || "Không thể tìm kiếm nhóm");
    }
  };

  // ====================
  // LEAVE GROUP
  // ====================
  const handleLeave = (maNhom) => {
    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
      Alert.alert("Lỗi", "Không tìm thấy mã sinh viên");
      return;
    }

    Alert.alert("Xác nhận", "Bạn muốn rời nhóm này?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Rời",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await leaveGroup(currentUserId, maNhom);

            if (res.success) {
              Alert.alert("Thành công", res.message || "Đã rời nhóm");
              loadGroups(search);
            } else {
              Alert.alert("Lỗi", res.message || "Rời nhóm thất bại");
            }
          } catch (err) {
            Alert.alert("Lỗi", err.message || "Không thể rời nhóm");
          }
        },
      },
    ]);
  };

  // ====================
  // RENDER ITEM
  // ====================
  const renderItem = ({ item }) => {
    const maNhom = getGroupId(item);
    const tenNhom = getGroupName(item);
    const tenMonHoc = getGroupSubjectName(item);
    const tenHienThi = getGroupDisplayName(item);
    const tenGiangVien = getTeacherName(item);
    const siSo = getGroupSize(item);

    return (
      <View style={styles.card}>
        <Text style={styles.title}>📘 {tenHienThi || tenNhom}</Text>

        <Text style={styles.info}>
          🏫 Nhóm: <Text style={styles.bold}>{tenNhom || "Chưa có nhóm"}</Text>
        </Text>

        <Text style={styles.info}>
          📚 Môn học:{" "}
          <Text style={styles.bold}>{tenMonHoc || "Chưa có môn"}</Text>
        </Text>

        {!!tenGiangVien && (
          <Text style={styles.info}>
            👨‍🏫 Giảng viên: <Text style={styles.bold}>{tenGiangVien}</Text>
          </Text>
        )}

        <Text style={styles.info}>
          👥 Sĩ số: <Text style={styles.bold}>{siSo}</Text>
        </Text>

        <TouchableOpacity
          style={styles.leaveBtn}
          onPress={() => handleLeave(maNhom)}
        >
          <Text style={styles.actionText}>Rời nhóm</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <MainLayoutSV navigation={navigation} title="📚 Nhóm của tôi">
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Đang tải nhóm...</Text>
        </View>
      </MainLayoutSV>
    );
  }

  return (
    <MainLayoutSV navigation={navigation} title="📚 Nhóm của tôi">
      <View style={styles.container}>
        {/* TOP BAR */}
        <View style={styles.topBar}>
          <TextInput
            placeholder="🔍 Tìm kiếm nhóm, môn học..."
            placeholderTextColor="#8b95a7"
            value={search}
            onChangeText={handleSearch}
            style={styles.search}
          />

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate("JoinGroupScreen")}
          >
            <Text style={styles.addText}>＋</Text>
          </TouchableOpacity>
        </View>

        {/* SUMMARY */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Tổng số nhóm đang tham gia</Text>
          <Text style={styles.summaryNumber}>{groups.length}</Text>
        </View>

        {/* LIST */}
        <FlatList
          data={groups}
          keyExtractor={(item, index) => String(getGroupId(item) || index)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.empty}>Không có nhóm nào</Text>
            </View>
          }
        />
      </View>
    </MainLayoutSV>
  );
}

// ================= STYLE =================
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

  loadingText: {
    marginTop: 10,
    color: "#64748b",
    fontWeight: "700",
  },

  // TOP BAR
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 10,
  },

  search: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    color: "#111827",
  },

  addBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#2ecc71",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },

  addText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },

  summaryBox: {
    backgroundColor: "#2563eb",
    borderRadius: 16,
    padding: 15,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  summaryTitle: {
    color: "#dbeafe",
    fontWeight: "800",
    fontSize: 15,
  },

  summaryNumber: {
    color: "white",
    fontWeight: "900",
    fontSize: 26,
  },

  listContent: {
    paddingBottom: 20,
  },

  // CARD
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  title: {
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 8,
    color: "#111827",
    lineHeight: 24,
  },

  info: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
    lineHeight: 20,
  },

  bold: {
    fontWeight: "bold",
    color: "#000",
  },

  leaveBtn: {
    marginTop: 13,
    backgroundColor: "#e74c3c",
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center",
  },

  actionText: {
    color: "#fff",
    fontWeight: "bold",
  },

  emptyBox: {
    marginTop: 80,
    alignItems: "center",
  },

  emptyIcon: {
    fontSize: 44,
    marginBottom: 8,
  },

  empty: {
    textAlign: "center",
    color: "#888",
    fontWeight: "800",
  },
});
