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
  Image,
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
  getThongBaoSVId,
  getThongBaoSVContent,
  getThongBaoSVTeacher,
  getThongBaoSVGroups,
  getNhomSVLabel,
  stripHtmlSV,
  parseThongBaoSVAttachments,
} from "../../api/thongbaosv";

const API_ROOT = API_URL.replace(/\/$/, "");

const getFullUrl = (url) => {
  if (!url) return "";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${API_ROOT}${url}`;
};

const isImageAttachment = (att) => {
  if (!att) return false;

  if (att.type === "image") return true;

  const cleanUrl = String(att.url || "").split("?")[0].toLowerCase();

  return (
    cleanUrl.endsWith(".jpg") ||
    cleanUrl.endsWith(".jpeg") ||
    cleanUrl.endsWith(".png") ||
    cleanUrl.endsWith(".gif") ||
    cleanUrl.endsWith(".webp")
  );
};

const getAttachmentIcon = (att) => {
  if (!att) return "📎";
  if (isImageAttachment(att)) return "🖼";
  if (att.type === "link") return "🔗";
  return "📎";
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
  const loadData = async (keyword = search) => {
    const currentUserId = getCurrentUserId();

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
        getThongBaoSV(currentUserId, keyword),
        getThongBaoSVUnreadCount(currentUserId),
        getNhomSV(currentUserId),
      ]);

      if (tbData.success) {
        setList(tbData.data || tbData.Data || []);
      } else {
        Alert.alert("Lỗi", tbData.message || "Không lấy được thông báo");
      }

      if (unreadData.success) {
        setUnreadCount(unreadData.count || unreadData.Count || 0);
      }

      if (nhomData.success) {
        setGroups(nhomData.data || nhomData.Data || []);
      }
    } catch (err) {
      Alert.alert("Lỗi", err.message || "Không thể tải thông báo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData("");
  }, [user]);

  // ====================
  // REFRESH
  // ====================
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData(search);
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
        setList(res.data || res.Data || []);
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
        setSelectedItem(res.data || res.Data);
        setDetailVisible(true);

        // Đánh dấu đã xem đã được backend xử lý khi gọi Detail.
        // Cập nhật lại danh sách và số chưa đọc.
        await loadData(search);
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
  // RENDER ATTACHMENTS
  // ====================
  const renderAttachments = (item, compact = false) => {
    const attachments = parseThongBaoSVAttachments(item);

    if (!attachments || attachments.length === 0) return null;

    return (
      <View style={compact ? styles.attachCompactBox : styles.attachBox}>
        <Text style={styles.attachTitle}>Đính kèm ({attachments.length})</Text>

        {attachments.map((att, index) => {
          const url = getFullUrl(att.url);

          if (isImageAttachment(att)) {
            return (
              <TouchableOpacity
                key={`${att.url}-${index}`}
                style={styles.imageAttachItem}
                onPress={() => Linking.openURL(url)}
              >
                <Image
                  source={{ uri: url }}
                  style={compact ? styles.attachImageSmall : styles.attachImage}
                />

                <View style={styles.attachTextBox}>
                  <Text style={styles.attachName} numberOfLines={2}>
                    🖼 {att.name || "Ảnh đính kèm"}
                  </Text>
                  <Text style={styles.attachHint}>Bấm để xem ảnh</Text>
                </View>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={`${att.url}-${index}`}
              style={styles.fileButton}
              onPress={() => Linking.openURL(url)}
            >
              <Text style={styles.fileText} numberOfLines={2}>
                {getAttachmentIcon(att)} {att.name || att.url}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // ====================
  // RENDER ITEM
  // ====================
  const renderItem = ({ item }) => {
    const id = getThongBaoSVId(item);
    const isUnread = !item.DaXem && !item.daXem;
    const teacher = getThongBaoSVTeacher(item);
    const itemGroups = getThongBaoSVGroups(item);
    const attachments = parseThongBaoSVAttachments(item);

    let text = stripHtmlSV(getThongBaoSVContent(item) || "");

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

            {!!teacher && (
              <Text style={styles.teacher}>👨‍🏫 {teacher}</Text>
            )}
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.date}>🕒 {formatDate(item.ThoiGianTao || item.thoiGianTao)}</Text>

          {!!itemGroups?.length && (
            <Text style={styles.group}>
              🏫 {itemGroups.map((n) => getNhomSVLabel(n)).join(", ")}
            </Text>
          )}
        </View>

        {attachments.length > 0 && renderAttachments(item, true)}

        <TouchableOpacity
          style={styles.detailBtn}
          onPress={() => openDetail(id)}
        >
          <Text style={styles.detailBtnText}>Xem chi tiết</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const selectedTeacher = selectedItem ? getThongBaoSVTeacher(selectedItem) : "";
  const selectedGroups = selectedItem ? getThongBaoSVGroups(selectedItem) : [];
  const selectedText = selectedItem
    ? stripHtmlSV(getThongBaoSVContent(selectedItem) || "")
    : "";

  return (
    <MainLayoutSV navigation={navigation} title="📢 Thông báo">
      <View style={styles.container}>
        {/* SUMMARY */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTextWrap}>
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
                <View key={g.MaNhom || g.maNhom} style={styles.groupChip}>
                  <Text style={styles.groupChipText}>
                    {getNhomSVLabel(g)}
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
            keyExtractor={(item) => String(getThongBaoSVId(item))}
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
              {selectedText ? (
                <Text style={styles.detailText}>{selectedText}</Text>
              ) : selectedItem?.NoiDung ? (
                <RenderHTML
                  contentWidth={width - 50}
                  source={{
                    html: selectedItem.NoiDung,
                  }}
                  baseStyle={styles.htmlBase}
                />
              ) : (
                <Text style={styles.empty}>Không có nội dung</Text>
              )}
            </View>

            <View style={styles.detailInfoBox}>
              {!!selectedTeacher && (
                <Text style={styles.teacherDetail}>
                  👨‍🏫 Giảng viên: {selectedTeacher}
                </Text>
              )}

              <Text style={styles.date}>
                🕒 {formatDate(selectedItem?.ThoiGianTao || selectedItem?.thoiGianTao)}
              </Text>

              {!!selectedGroups?.length && (
                <>
                  <Text style={styles.detailLabel}>Lớp - môn:</Text>

                  {selectedGroups.map((n, index) => (
                    <Text key={index} style={styles.groupDetail}>
                      • {getNhomSVLabel(n)}
                    </Text>
                  ))}
                </>
              )}

              {selectedItem && renderAttachments(selectedItem, false)}
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

  summaryTextWrap: {
    flex: 1,
    paddingRight: 12,
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

  attachCompactBox: {
    marginBottom: 10,
  },

  attachBox: {
    marginTop: 12,
  },

  attachTitle: {
    fontWeight: "900",
    color: "#475569",
    marginBottom: 8,
  },

  imageAttachItem: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 9,
    marginBottom: 8,
  },

  attachImage: {
    width: 120,
    height: 90,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: "#e5e7eb",
  },

  attachImageSmall: {
    width: 76,
    height: 58,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: "#e5e7eb",
  },

  attachTextBox: {
    flex: 1,
    justifyContent: "center",
  },

  attachName: {
    color: "#2563eb",
    fontWeight: "900",
    lineHeight: 20,
  },

  attachHint: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
    fontWeight: "600",
  },

  fileButton: {
    backgroundColor: "#fef3c7",
    padding: 11,
    borderRadius: 13,
    marginBottom: 8,
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

  detailText: {
    color: "#111827",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
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
