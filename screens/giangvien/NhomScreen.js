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
  Modal,
  ScrollView,
  SafeAreaView,
} from "react-native";

import MainLayout from "../../components/MainLayout";
import { AuthContext } from "../../context/AuthContext";

import {
  getNhom,
  getMonHocGV,
  createNhom,
  deleteNhom,
  getNhomDetail,
  addStudent,
  removeStudent,
  getNhomId,
  getNhomName,
  getNhomSubjectName,
  getNhomInviteCode,
  getNhomSize,
  getStudentId,
  getStudentName,
  getStudentEmail,
} from "../../api/nhom";

export default function NhomScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  const [groups, setGroups] = useState([]);
  const [monHocList, setMonHocList] = useState([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [createVisible, setCreateVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);

  const [tenNhom, setTenNhom] = useState("");
  const [selectedMonHoc, setSelectedMonHoc] = useState(null);

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentEmail, setStudentEmail] = useState("");

  // ====================
  // GET USER ID
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
      user?.maGiangVien ||
      user?.MaGiangVien ||
      user?.gvId ||
      user?.GVId ||
      ""
    );
  };

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(String(email || "").trim());
  };

  const updateGroupInList = (updatedGroup) => {
    if (!updatedGroup) return;

    const updatedId = getNhomId(updatedGroup);

    if (!updatedId) return;

    setGroups((prev) =>
      prev.map((g) =>
        getNhomId(g) === updatedId ? updatedGroup : g
      )
    );
  };

  // ====================
  // LOAD DATA
  // ====================
  const loadData = async (keyword = search) => {
    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
      setGroups([]);
      setMonHocList([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [groupRes, monHocRes] =
        await Promise.all([
          getNhom(currentUserId, keyword),
          getMonHocGV(currentUserId),
        ]);

      setGroups(
        groupRes.data ||
          groupRes.Data ||
          []
      );

      setMonHocList(
        monHocRes.data ||
          monHocRes.Data ||
          []
      );
    } catch (err) {
      Alert.alert(
        "Lỗi",
        err.message ||
          "Không thể tải danh sách lớp"
      );
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

    const currentUserId =
      getCurrentUserId();

    if (!currentUserId) {
      setGroups([]);
      return;
    }

    try {
      const res = await getNhom(
        currentUserId,
        text
      );

      setGroups(
        res.data ||
          res.Data ||
          []
      );
    } catch (err) {
      Alert.alert(
        "Lỗi",
        err.message ||
          "Không thể tìm kiếm lớp"
      );
    }
  };

  // ====================
  // CREATE
  // ====================
  const resetCreateForm = () => {
    setTenNhom("");
    setSelectedMonHoc(null);
    setSaving(false);
  };

  const openCreate = () => {
    resetCreateForm();
    setCreateVisible(true);
  };

  const handleCreate = async () => {
    const currentUserId =
      getCurrentUserId();

    if (!currentUserId) {
      Alert.alert(
        "Lỗi",
        "Không tìm thấy mã giảng viên"
      );
      return;
    }

    if (!tenNhom.trim()) {
      Alert.alert(
        "Thông báo",
        "Tên lớp không được để trống"
      );
      return;
    }

    if (!selectedMonHoc) {
      Alert.alert(
        "Thông báo",
        "Vui lòng chọn môn học"
      );
      return;
    }

    try {
      setSaving(true);

      const res = await createNhom({
        userId: currentUserId,
        tenNhom: tenNhom.trim(),
        maMonHoc: selectedMonHoc,
      });

      Alert.alert(
        "Thành công",
        res.message ||
          "Tạo lớp thành công"
      );

      setCreateVisible(false);
      resetCreateForm();
      loadData(search);
    } catch (err) {
      Alert.alert(
        "Lỗi",
        err.message ||
          "Tạo lớp thất bại"
      );
    } finally {
      setSaving(false);
    }
  };

  // ====================
  // DETAIL
  // ====================
  const openDetail = async (item) => {
    const currentUserId =
      getCurrentUserId();

    const maNhom =
      getNhomId(item);

    if (!currentUserId) {
      Alert.alert(
        "Lỗi",
        "Không tìm thấy mã giảng viên"
      );
      return;
    }

    if (!maNhom) {
      Alert.alert(
        "Lỗi",
        "Thiếu mã nhóm"
      );
      return;
    }

    try {
      setLoading(true);

      const res =
        await getNhomDetail(
          currentUserId,
          maNhom
        );

      setSelectedGroup(
        res.data || item
      );

      setStudents(
        res.students ||
          res.sinhVien ||
          res.SinhVien ||
          []
      );

      setStudentEmail("");
      setDetailVisible(true);
    } catch (err) {
      Alert.alert(
        "Lỗi",
        err.message ||
          "Không thể xem chi tiết lớp"
      );
    } finally {
      setLoading(false);
    }
  };

  // ====================
  // DELETE
  // ====================
  const handleDelete = (item) => {
    const currentUserId =
      getCurrentUserId();

    const maNhom =
      getNhomId(item);

    Alert.alert(
      "Xóa lớp",
      "Xóa lớp này?",
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
              const res =
                await deleteNhom(
                  currentUserId,
                  maNhom
                );

              Alert.alert(
                "Thành công",
                res.message ||
                  "Xóa lớp thành công"
              );

              loadData(search);
            } catch (err) {
              Alert.alert(
                "Lỗi",
                err.message ||
                  "Không thể xóa lớp"
              );
            }
          },
        },
      ]
    );
  };

  // ====================
  // ADD STUDENT
  // ====================
  const handleAddStudent =
    async () => {
      const currentUserId =
        getCurrentUserId();

      const maNhom =
        getNhomId(selectedGroup);

      const email =
        studentEmail.trim();

      if (!email) {
        Alert.alert(
          "Thông báo",
          "Vui lòng nhập email"
        );
        return;
      }

      if (!isValidEmail(email)) {
        Alert.alert(
          "Thông báo",
          "Email không đúng định dạng"
        );
        return;
      }

      try {
        setSaving(true);

        const res =
          await addStudent(
            currentUserId,
            maNhom,
            email
          );

        const updatedGroup =
          res.data ||
          selectedGroup;

        const updatedStudents =
          res.sinhVien ||
          res.SinhVien ||
          res.students ||
          [];

        setSelectedGroup(
          updatedGroup
        );

        setStudents(
          updatedStudents
        );

        updateGroupInList(
          updatedGroup
        );

        setStudentEmail("");

        Alert.alert(
          "Thành công",
          res.message ||
            "Thêm sinh viên thành công"
        );

        await loadData(search);
      } catch (err) {
        Alert.alert(
          "Lỗi",
          err.message ||
            "Không thể thêm sinh viên"
        );
      } finally {
        setSaving(false);
      }
    };

  // ====================
  // REMOVE STUDENT
  // ====================
  const handleRemoveStudent = (
    sv
  ) => {
    const currentUserId =
      getCurrentUserId();

    const maNhom =
      getNhomId(selectedGroup);

    const maNguoiDung =
      getStudentId(sv);

    Alert.alert(
      "Xóa sinh viên",
      "Xóa sinh viên này khỏi lớp?",
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
              const res =
                await removeStudent(
                  currentUserId,
                  maNhom,
                  maNguoiDung
                );

              const updatedGroup =
                res.data ||
                selectedGroup;

              const updatedStudents =
                res.sinhVien ||
                res.SinhVien ||
                res.students ||
                [];

              setSelectedGroup(
                updatedGroup
              );

              setStudents(
                updatedStudents
              );

              updateGroupInList(
                updatedGroup
              );

              Alert.alert(
                "Thành công",
                res.message ||
                  "Đã xóa sinh viên"
              );

              await loadData(
                search
              );
            } catch (err) {
              Alert.alert(
                "Lỗi",
                err.message ||
                  "Không thể xóa sinh viên"
              );
            }
          },
        },
      ]
    );
  };

  // ====================
  // RENDER GROUP
  // ====================
  const renderGroupItem = ({
    item,
  }) => {
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          📚 {getNhomName(item)}
        </Text>

        <Text style={styles.cardInfo}>
          📘 Môn học:{" "}
          <Text style={styles.bold}>
            {getNhomSubjectName(
              item
            ) || "Không có"}
          </Text>
        </Text>

        <Text style={styles.cardInfo}>
          👨‍🎓 Sĩ số:{" "}
          <Text style={styles.bold}>
            {getNhomSize(item)}
          </Text>
        </Text>

        {!!getNhomInviteCode(
          item
        ) && (
          <View style={styles.badge}>
            <Text
              style={
                styles.badgeText
              }
            >
              Mã mời:{" "}
              {getNhomInviteCode(
                item
              )}
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.btnDetail}
            onPress={() =>
              openDetail(item)
            }
          >
            <Text style={styles.btnText}>
              Chi tiết
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnDelete}
            onPress={() =>
              handleDelete(item)
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

  // ====================
  // RENDER STUDENT
  // ====================
  const renderStudentItem = ({
    item,
  }) => {
    return (
      <View style={styles.studentRow}>
        <View
          style={styles.studentInfo}
        >
          <Text
            style={
              styles.studentName
            }
          >
            {getStudentName(item)}
          </Text>

          <Text
            style={
              styles.studentEmail
            }
          >
            {getStudentEmail(item)}
          </Text>
        </View>

        <TouchableOpacity
          style={
            styles.btnStudentDelete
          }
          onPress={() =>
            handleRemoveStudent(
              item
            )
          }
        >
          <Text
            style={
              styles.btnTextSmall
            }
          >
            Xóa
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <MainLayout
      navigation={navigation}
      title="📚 Danh sách lớp"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            📚 Danh sách lớp
          </Text>

          <TouchableOpacity
            style={styles.btnCreate}
            onPress={openCreate}
          >
            <Text
              style={
                styles.btnCreateText
              }
            >
              + Tạo lớp
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchWrap}>
          <TextInput
            placeholder="Tìm lớp..."
            placeholderTextColor="#8b95a7"
            value={search}
            onChangeText={
              handleSearch
            }
            style={styles.search}
          />
        </View>

        <FlatList
          data={groups}
          keyExtractor={(
            item,
            index
          ) =>
            String(
              getNhomId(item) ||
                index
            )
          }
          renderItem={
            renderGroupItem
          }
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.listContent
          }
          refreshControl={
            <RefreshControl
              refreshing={
                refreshing
              }
              onRefresh={
                onRefresh
              }
            />
          }
        />

        {/* DETAIL MODAL FIX TAI THỎ */}
        <Modal
          visible={detailVisible}
          animationType="slide"
        >
          <SafeAreaView
            style={{
              flex: 1,
              backgroundColor:
                "#f4f6fb",
            }}
          >
            <ScrollView
              contentContainerStyle={
                styles.modalContainer
              }
            >
              <TouchableOpacity
                style={
                  styles.backBtn
                }
                onPress={() => {
                  setDetailVisible(
                    false
                  );
                  setSelectedGroup(
                    null
                  );
                  setStudents([]);
                  setStudentEmail(
                    ""
                  );
                }}
              >
                <Text
                  style={
                    styles.backText
                  }
                >
                  ← Quay lại
                </Text>
              </TouchableOpacity>

              {selectedGroup && (
                <>
                  <View
                    style={
                      styles.detailCard
                    }
                  >
                    <Text
                      style={
                        styles.detailTitle
                      }
                    >
                      📚{" "}
                      {getNhomName(
                        selectedGroup
                      )}
                    </Text>

                    <Text
                      style={
                        styles.detailInfo
                      }
                    >
                      📖 Môn học:{" "}
                      <Text
                        style={
                          styles.bold
                        }
                      >
                        {getNhomSubjectName(
                          selectedGroup
                        )}
                      </Text>
                    </Text>

                    <Text
                      style={
                        styles.detailInfo
                      }
                    >
                      👨‍🎓 Sĩ số:{" "}
                      <Text
                        style={
                          styles.bold
                        }
                      >
                        {getNhomSize(
                          selectedGroup
                        )}
                      </Text>
                    </Text>
                  </View>

                  <View
                    style={
                      styles.detailCard
                    }
                  >
                    <Text
                      style={
                        styles.detailTitle
                      }
                    >
                      ➕ Thêm sinh viên
                    </Text>

                    <View
                      style={
                        styles.addStudentRow
                      }
                    >
                      <TextInput
                        value={
                          studentEmail
                        }
                        onChangeText={
                          setStudentEmail
                        }
                        placeholder="Nhập email..."
                        placeholderTextColor="#9ca3af"
                        style={
                          styles.studentInput
                        }
                      />

                      <TouchableOpacity
                        style={
                          styles.btnAddStudent
                        }
                        onPress={
                          handleAddStudent
                        }
                      >
                        <Text
                          style={
                            styles.btnText
                          }
                        >
                          Thêm
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View
                    style={
                      styles.detailCard
                    }
                  >
                    <Text
                      style={
                        styles.detailTitle
                      }
                    >
                      👥 Danh sách sinh viên
                    </Text>

                    <FlatList
                      data={students}
                      keyExtractor={(
                        item,
                        index
                      ) =>
                        String(
                          getStudentId(
                            item
                          ) ||
                            index
                        )
                      }
                      renderItem={
                        renderStudentItem
                      }
                      scrollEnabled={
                        false
                      }
                    />
                  </View>
                </>
              )}
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      "#f4f6fb",
    padding: 15,
  },

  header: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  title: {
    fontSize: 23,
    fontWeight: "900",
    color: "#111827",
  },

  btnCreate: {
    backgroundColor: "#4CAF50",
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 10,
  },

  btnCreateText: {
    color: "white",
    fontWeight: "900",
  },

  searchWrap: {
    backgroundColor: "white",
    borderRadius: 14,
    marginBottom: 14,
  },

  search: {
    paddingHorizontal: 13,
    paddingVertical: 12,
  },

  listContent: {
    paddingBottom: 25,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 10,
  },

  cardInfo: {
    marginBottom: 6,
  },

  bold: {
    fontWeight: "900",
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#e3f2fd",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginTop: 5,
  },

  badgeText: {
    color: "#1976d2",
    fontWeight: "800",
  },

  actions: {
    flexDirection: "row",
    marginTop: 15,
    gap: 9,
  },

  btnDetail: {
    flex: 1,
    backgroundColor: "#2196F3",
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: "center",
  },

  btnDelete: {
    flex: 1,
    backgroundColor: "#f44336",
    paddingVertical: 11,
    borderRadius: 8,
    alignItems: "center",
  },

  btnText: {
    color: "white",
    fontWeight: "900",
  },

  modalContainer: {
    padding: 24,
    paddingTop: 10,
  },

  backBtn: {
    marginBottom: 15,
  },

  backText: {
    color: "#333",
    fontWeight: "900",
    fontSize: 16,
  },

  detailCard: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
  },

  detailTitle: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 12,
  },

  detailInfo: {
    marginBottom: 8,
  },

  addStudentRow: {
    flexDirection: "row",
    gap: 10,
  },

  studentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 11,
  },

  btnAddStudent: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 15,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  studentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  studentInfo: {
    flex: 1,
  },

  studentName: {
    fontWeight: "900",
  },

  studentEmail: {
    color: "#64748b",
  },

  btnStudentDelete: {
    backgroundColor: "#f44336",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
  },

  btnTextSmall: {
    color: "white",
    fontWeight: "900",
    fontSize: 13,
  },
});