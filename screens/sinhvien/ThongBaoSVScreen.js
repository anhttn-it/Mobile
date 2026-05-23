import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Linking,
  useWindowDimensions,
} from "react-native";

import RenderHTML from "react-native-render-html";

import MainLayoutSV from "../../components/MainLayoutSV";
import { AuthContext } from "../../context/AuthContext";
import { API_URL } from "../../api/config";

import {
  getThongBaoSV,
  getThongBaoSVDetail,
  getThongBaoSVUnreadCount,
  getNhomSV,
} from "../../api/thongbaosv";

const API_ROOT = API_URL.replace(/\/$/, "");

const getFullUrl = (url) => {
  if (!url) return "";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${API_ROOT}${url}`;
};

export default function ThongBaoSVScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const { width } = useWindowDimensions();

  const [list, setList] = useState([]);
  const [groups, setGroups] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [unreadCount, setUnreadCount] = useState(0);

  // ====================
  // LẤY MÃ SINH VIÊN / USER ID
  // ====================
  const getCurrentUserId = () => {
    console.log("AUTH USER FULL SV:", JSON.stringify(user, null, 2));

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
  // LOAD DATA
  // ====================
  const loadData = async () => {
    const currentUserId = getCurrentUserId();

    console.log("CURRENT SV ID GUI LEN API:", currentUserId);

    // Khi đăng xuất thì không báo lỗi, chỉ reset màn hình
    if (!currentUserId) {
      setList([]);
      setGroups([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [tbData, unreadData, nhomData] = await Promise.all([
        getThongBaoSV(currentUserId, search),
        getThongBaoSVUnreadCount(currentUserId),
        getNhomSV(currentUserId),
      ]);

      console.log("THONG BAO SV DATA:", tbData);
      console.log("UNREAD SV DATA:", unreadData);
      console.log("NHOM SV DATA:", nhomData);

      if (tbData.success) {
        setList(tbData.data || []);
      } else {
        Alert.alert("Lỗi", tbData.message || "Không lấy được thông báo");
      }

      if (unreadData.success) {
        setUnreadCount(unreadData.count || 0);
      }

      if (nhomData.success) {
        setGroups(nhomData.data || []);
      }
    } catch (err) {
      Alert.alert("Lỗi", err.message || "Không thể tải thông báo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // ====================
  // REFRESH
  // ====================
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // ====================
  // SEARCH
  // ====================
  const handleSearch = async (text) => {
    setSearch(text);

    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
      setList([]);
      return;
    }

    try {
      const res = await getThongBaoSV(currentUserId, text);

      if (res.success) {
        setList(res.data || []);
      } else {
        Alert.alert("Lỗi", res.message || "Không tìm kiếm được thông báo");
      }
    } catch (err) {
      Alert.alert("Lỗi", err.message || "Không thể tìm kiếm");
    }
  };

  // ====================
  // OPEN DETAIL
  // ====================
  const openDetail = async (id) => {
    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
      Alert.alert("Lỗi", "Không tìm thấy mã sinh viên");
      return;
    }

    try {
      const res = await getThongBaoSVDetail(id, currentUserId);

      if (res.success) {
        setSelectedItem(res.data);
        setDetailVisible(true);

        // Cập nhật lại danh sách để đổi trạng thái đã xem
        loadData();
      } else {
        Alert.alert("Lỗi", res.message || "Không lấy được chi tiết");
      }
    } catch (err) {
      Alert.alert("Lỗi", err.message || "Không thể lấy chi tiết");
    }
  };

  // ====================
  // FORMAT DATE FIX ASP.NET DATE
  // ====================
  const formatDate = (date) => {
    if (!date) return "";

    let d;

    if (typeof date === "string" && date.includes("/Date(")) {
      const match = date.match(/-?\d+/);

      if (!match) return "";

      d = new Date(parseInt(match[0], 10));
    } else {
      d = new Date(date);
    }

    if (isNaN(d.getTime())) {
      return "";
    }

    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(
      2,
      "0"
    )}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  // ====================
  // REMOVE HTML
  // ====================
  const stripHtml = (html = "") => {
    return html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]*>?/gm, "")
      .replace(/&nbsp;/g, " ")
      .trim();
  };

  // ====================
  // RENDER ITEM
  // ====================
  const renderItem = ({ item }) => {
    const isUnread = !item.DaXem;

    let text = stripHtml(item.NoiDung || "");

    if (text.length > 130) {
      text = text.substring(0, 130) + "...";
    }

    return (
      <View style={[styles.card, isUnread && styles.cardUnread]}>
        <View style={styles.cardTop}>
          <View style={[styles.iconBox, isUnread && styles.iconBoxUnread]}>
            <Text style={styles.iconText}>{isUnread ? "🔔" : "📢"}</Text>
          </View>

          <View style={styles.cardTitleWrap}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{text || "Thông báo"}</Text>

              {isUnread && (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>Mới</Text>
                </View>
              )}
            </View>

            {!!item.TenGiangVien && (
              <Text style={styles.teacher}>👨‍🏫 {item.TenGiangVien}</Text>
            )}
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.date}>🕒 {formatDate(item.ThoiGianTao)}</Text>

          {!!item.Nhom?.length && (
            <Text style={styles.group}>
              🏫{" "}
              {item.Nhom.map((n) =>
                n.TenLopMon || `${n.TenNhom} - ${n.TenMonHoc}`
              ).join(", ")}
            </Text>
          )}
        </View>

        {!!item.FileDinhKem && (
          <TouchableOpacity
            style={styles.fileButton}
            onPress={() => Linking.openURL(getFullUrl(item.FileDinhKem))}
          >
            <Text style={styles.fileText}>📎 Xem / tải file đính kèm</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.detailBtn}
          onPress={() => openDetail(item.MaThongBao)}
        >
          <Text style={styles.detailBtnText}>Xem chi tiết</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <MainLayoutSV navigation={navigation} title="📢 Thông báo">
      <View style={styles.container}>
        {/* SUMMARY */}
        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryTitle}>Thông báo lớp của bạn</Text>

            <Text style={styles.summarySub}>
              {groups.length > 0
                ? `${groups.length} lớp - môn đang theo học`
                : "Chưa có lớp - môn"}
            </Text>
          </View>

          <View style={styles.unreadCircle}>
            <Text style={styles.unreadNumber}>{unreadCount}</Text>
            <Text style={styles.unreadText}>chưa đọc</Text>
          </View>
        </View>

        {/* SEARCH */}
        <View style={styles.topBar}>
          <View style={styles.searchWrap}>
            <Text style={styles.searchIcon}>🔎</Text>

            <TextInput
              placeholder="Tìm theo nội dung, giảng viên..."
              placeholderTextColor="#8b95a7"
              value={search}
              onChangeText={handleSearch}
              style={styles.search}
            />
          </View>
        </View>

        {/* GROUPS */}
        {!!groups.length && (
          <View style={styles.groupSummary}>
            <Text style={styles.groupSummaryTitle}>Lớp - môn của bạn:</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {groups.map((g) => (
                <View key={g.MaNhom} style={styles.groupChip}>
                  <Text style={styles.groupChipText}>
                    {g.TenLopMon || `${g.TenNhom} - ${g.TenMonHoc}`}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* LIST */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#2f80ed" />

            <Text style={styles.loadingText}>Đang tải thông báo...</Text>
          </View>
        ) : (
          <FlatList
            data={list}
            keyExtractor={(item) => item.MaThongBao.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyBox}>
                <Text style={styles.emptyIcon}>📭</Text>

                <Text style={styles.empty}>Không có thông báo</Text>
              </View>
            }
          />
        )}

        {/* DETAIL MODAL */}
        <Modal visible={detailVisible} animationType="slide">
          <ScrollView contentContainerStyle={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalIcon}>📄</Text>

              <Text style={styles.titleModal}>Chi tiết thông báo</Text>
            </View>

            <View style={styles.detailContentBox}>
              {!!selectedItem?.NoiDung && (
                <RenderHTML
                  contentWidth={width - 50}
                  source={{
                    html: selectedItem.NoiDung,
                  }}
                  baseStyle={styles.htmlBase}
                />
              )}
            </View>

            <View style={styles.detailInfoBox}>
              {!!selectedItem?.TenGiangVien && (
                <Text style={styles.teacherDetail}>
                  👨‍🏫 Giảng viên: {selectedItem.TenGiangVien}
                </Text>
              )}

              <Text style={styles.date}>
                🕒 {formatDate(selectedItem?.ThoiGianTao)}
              </Text>

              {!!selectedItem?.Nhoms?.length && (
                <>
                  <Text style={styles.detailLabel}>Lớp - môn:</Text>

                  {selectedItem.Nhoms.map((n, index) => (
                    <Text key={index} style={styles.groupDetail}>
                      • {n.TenLopMon || `${n.TenNhom} - ${n.TenMonHoc}`}
                    </Text>
                  ))}
                </>
              )}

              {!!selectedItem?.FileDinhKem && (
                <TouchableOpacity
                  style={styles.fileButton}
                  onPress={() =>
                    Linking.openURL(getFullUrl(selectedItem.FileDinhKem))
                  }
                >
                  <Text style={styles.fileText}>📎 Xem / tải file đính kèm</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => {
                setDetailVisible(false);
                setSelectedItem(null);
              }}
            >
              <Text style={styles.close}>Đóng</Text>
            </TouchableOpacity>
          </ScrollView>
        </Modal>
      </View>
    </MainLayoutSV>
  );
}

// ====================
// STYLE
// ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#eef3ff",
  },

  summaryCard: {
    backgroundColor: "#2563eb",
    padding: 18,
    borderRadius: 22,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
  },

  summaryTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "900",
  },

  summarySub: {
    color: "#dbeafe",
    fontWeight: "700",
    marginTop: 6,
  },

  unreadCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },

  unreadNumber: {
    fontSize: 22,
    fontWeight: "900",
    color: "#2563eb",
  },

  unreadText: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "700",
  },

  topBar: {
    marginBottom: 14,
  },

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 18,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#dbe5ff",
    elevation: 2,
  },

  searchIcon: {
    fontSize: 18,
    marginRight: 6,
  },

  search: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1f2937",
  },

  groupSummary: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e5edff",
  },

  groupSummaryTitle: {
    fontWeight: "900",
    color: "#1f2937",
    marginBottom: 10,
  },

  groupChip: {
    backgroundColor: "#dbeafe",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginRight: 8,
  },

  groupChipText: {
    color: "#1d4ed8",
    fontWeight: "800",
  },

  loadingBox: {
    marginTop: 80,
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    color: "#64748b",
    fontWeight: "700",
  },

  card: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 22,
    marginBottom: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#e6edff",
  },

  cardUnread: {
    borderColor: "#60a5fa",
    backgroundColor: "#f8fbff",
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  iconBoxUnread: {
    backgroundColor: "#dbeafe",
  },

  iconText: {
    fontSize: 22,
  },

  cardTitleWrap: {
    flex: 1,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
    lineHeight: 25,
  },

  newBadge: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginLeft: 8,
  },

  newBadgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "900",
  },

  teacher: {
    marginTop: 8,
    color: "#475569",
    fontWeight: "700",
  },

  infoBox: {
    backgroundColor: "#f0f7ff",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#cfe5ff",
  },

  date: {
    color: "#64748b",
    marginBottom: 8,
    fontWeight: "700",
  },

  group: {
    color: "#2563eb",
    fontWeight: "800",
    lineHeight: 22,
  },

  fileButton: {
    backgroundColor: "#fef3c7",
    padding: 11,
    borderRadius: 13,
    marginBottom: 12,
  },

  fileText: {
    color: "#b45309",
    fontWeight: "900",
  },

  detailBtn: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 4,
  },

  detailBtnText: {
    color: "white",
    fontWeight: "900",
    fontSize: 15,
  },

  emptyBox: {
    marginTop: 120,
    alignItems: "center",
  },

  emptyIcon: {
    fontSize: 45,
    marginBottom: 8,
  },

  empty: {
    color: "#64748b",
    fontWeight: "800",
  },

  modal: {
    padding: 25,
    backgroundColor: "#f8fbff",
    minHeight: "100%",
  },

  modalHeader: {
    alignItems: "center",
    marginBottom: 22,
  },

  modalIcon: {
    fontSize: 38,
    marginBottom: 8,
  },

  titleModal: {
    fontSize: 27,
    fontWeight: "900",
    color: "#111827",
    textAlign: "center",
  },

  detailContentBox: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e5edff",
    marginBottom: 15,
  },

  htmlBase: {
    color: "#111827",
    fontSize: 16,
    lineHeight: 24,
  },

  detailInfoBox: {
    backgroundColor: "#f0f7ff",
    padding: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#cfe5ff",
  },

  teacherDetail: {
    color: "#334155",
    fontWeight: "900",
    marginBottom: 8,
  },

  detailLabel: {
    fontWeight: "900",
    color: "#1f2937",
    marginBottom: 8,
    marginTop: 8,
  },

  groupDetail: {
    marginBottom: 8,
    color: "#2563eb",
    fontWeight: "800",
  },

  closeBtn: {
    backgroundColor: "#ef4444",
    padding: 15,
    borderRadius: 15,
    marginTop: 18,
  },

  close: {
    textAlign: "center",
    color: "white",
    fontSize: 16,
    fontWeight: "900",
  },
});