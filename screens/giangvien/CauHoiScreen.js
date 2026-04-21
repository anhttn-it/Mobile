import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  RefreshControl,
} from "react-native";

import MainLayout from "../../components/MainLayout";
import { AuthContext } from "../../context/AuthContext";
import { getCauHoi, createCauHoi, deleteCauHoi, getMonHocByUser } from "../../api/cauhoi";

export default function CauHoiScreen({ navigation }) {
  
  const [openMonHoc, setOpenMonHoc] = useState(false);
  // =====================
  // CONTEXT (FIX: đặt lên trước useEffect)
  // =====================
  const { user } = useContext(AuthContext);

  // =====================
  // STATE
  // =====================
  const [monHocList, setMonHocList] = useState([]);
  const [selectedMonHoc, setSelectedMonHoc] = useState(null);

  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [doKho, setDoKho] = useState("1");
  const [noiDung, setNoiDung] = useState("");
  const [dapAn, setDapAn] = useState(["", "", "", ""]);
  const [dapAnDung, setDapAnDung] = useState(0);
  // =====================
  // LOAD DATA
  // =====================
  const loadData = async () => {
    if (!user?.userId) return;

    try {
      setLoading(true);
      const res = await getCauHoi(user.userId, null, search);

      setData(res);
      setFiltered(res);
    } catch (err) {
      console.log(err);
      Alert.alert("Lỗi", err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMonHoc = async () => {
    try {
      if (!user?.userId) return;
      const res = await getMonHocByUser(user.userId);
      setMonHocList(res);
    } catch (err) {
      console.log(err);
    }
  };

  // =====================
  // EFFECT (FIX dependency)
  // =====================
  useEffect(() => {
    if (user?.userId) {
      loadData();
      loadMonHoc();
    }
  }, [user]);

  // =====================
  // REFRESH
  // =====================
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // =====================
  // SEARCH
  // =====================
  const handleSearch = (text) => {
    setSearch(text);

    if (!text) {
      setFiltered(data);
      return;
    }

    const result = data.filter((item) =>
      item.NoiDung?.toLowerCase().includes(text.toLowerCase())
    );

    setFiltered(result);
  };

  // =====================
  // CREATE
  // =====================
  const handleCreate = async () => {
    try {
      if (!noiDung.trim()) {
        Alert.alert("Thiếu thông tin", "Vui lòng nhập nội dung câu hỏi");
        return;
      }

      if (!selectedMonHoc) {
        Alert.alert("Thiếu thông tin", "Vui lòng chọn môn học");
        return;
      }

      if (!user?.userId) {
        Alert.alert("Lỗi", "Không tìm thấy user");
        return;
      }

      const payload = {
      NoiDung: noiDung.trim(),
      DoKho: parseInt(doKho),
      MaMonHoc: selectedMonHoc,
      dapAn: dapAn,
      dapAnDung: dapAnDung,
      userId: user.userId,
    };

      console.log("📤 CREATE CAUHOI:", payload);

      await createCauHoi(payload);

      Alert.alert("Thành công", "Tạo câu hỏi thành công");

      setNoiDung("");
      setDoKho("1");
      setSelectedMonHoc(null);
      setModalVisible(false);

      loadData();
    } catch (err) {
      console.log(err);
      Alert.alert("Lỗi", err?.message || "Không thể tạo câu hỏi");
    }
  };

  // =====================
  // DELETE
  // =====================
  const handleDelete = async (id) => {
    Alert.alert("Xác nhận", "Bạn có muốn xóa câu hỏi này?", [
      { text: "Hủy" },
      {
        text: "Xóa",
        onPress: async () => {
          try {
            await deleteCauHoi(id, user.userId);
            loadData();
          } catch (err) {
            Alert.alert("Lỗi", err.message);
          }
        },
      },
    ]);
  };

  // =====================
  // ITEM
  // =====================
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>📌 {item.NoiDung}</Text>
      <Text>📊 Độ khó: {item.DoKho}</Text>
      <Text>📘 Môn học: {item.TenMonHoc}</Text>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() =>
            navigation.navigate("EditCauHoi", { id: item.MaCauHoi })
          }
        >
          <Text style={{ color: "#fff" }}>Sửa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item.MaCauHoi)}
        >
          <Text style={{ color: "#fff" }}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // =====================
  // UI
  // =====================
  if (!user) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Đang tải user...</Text>
      </View>
    );
  }

  return (
    <MainLayout title="📚 Câu hỏi" navigation={navigation}>
      <View style={styles.container}>

        {/* SEARCH */}
        <View style={styles.topBar}>
          <TextInput
            placeholder="Tìm câu hỏi..."
            value={search}
            onChangeText={handleSearch}
            style={styles.search}
          />

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setModalVisible(true)}
          >
            <Text style={{ color: "#fff" }}>+ Thêm</Text>
          </TouchableOpacity>
        </View>

        {/* LIST */}
        {loading ? (
          <ActivityIndicator size="large" />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.MaCauHoi.toString()}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}

        {/* MODAL */}
        <Modal visible={modalVisible} animationType="slide">
          <View style={styles.modal}>

            <Text style={styles.modalTitle}>➕ Tạo câu hỏi</Text>

            <TextInput
              placeholder="Nội dung"
              value={noiDung}
              onChangeText={setNoiDung}
              style={styles.input}
            />

            {/* ĐỘ KHÓ */}
            <Text style={styles.label}>Độ khó</Text>

            <View style={styles.rowSelect}>
              {["1", "2", "3"].map((lv) => (
                <TouchableOpacity
                  key={lv}
                  style={[
                    styles.levelBtn,
                    doKho === lv && styles.levelBtnActive,
                  ]}
                  onPress={() => setDoKho(lv)}
                >
                  <Text style={{ color: doKho === lv ? "#fff" : "#000" }}>
                    {lv}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>



            {/* ĐÁP ÁN */}
            <Text style={styles.label}>Đáp án</Text>

            {["A", "B", "C", "D"].map((key, index) => (
              <View key={index} style={styles.answerRow}>
                
                <Text style={{ width: 30 }}>{key}</Text>

                <TextInput
                  placeholder={`Nhập đáp án ${key}`}
                  value={dapAn[index]}
                  onChangeText={(text) => {
                    const newAns = [...dapAn];
                    newAns[index] = text;
                    setDapAn(newAns);
                  }}
                  style={styles.answerInput}
                />

                <TouchableOpacity
                  onPress={() => setDapAnDung(index)}
                  style={[
                    styles.correctBtn,
                    dapAnDung === index && styles.correctBtnActive,
                  ]}
                >
                  <Text style={{ color: "#fff" }}>✔</Text>
                </TouchableOpacity>

              </View>
            ))}





            {/* MÔN HỌC (DROPDOWN) */}
            <Text style={styles.label}>Môn học</Text>

            <TouchableOpacity
              style={styles.dropdownHeader}
              onPress={() => setOpenMonHoc(!openMonHoc)}
            >
              <Text>
                {selectedMonHoc
                  ? monHocList.find(x => x.MaMonHoc === selectedMonHoc)?.TenMonHoc
                  : "Chọn môn học"}
              </Text>
            </TouchableOpacity>

            {openMonHoc && (
              <View style={styles.dropdownBox}>
                {monHocList.map((item) => {
                  const isSelected = selectedMonHoc === item.MaMonHoc;

                  return (
                    <TouchableOpacity
                      key={item.MaMonHoc}
                      style={[
                        styles.dropdownItem,
                        isSelected && styles.dropdownActive,
                      ]}
                      onPress={() => {
                        setSelectedMonHoc(item.MaMonHoc);
                        setOpenMonHoc(false); // 👈 đóng dropdown
                      }}
                    >
                      <Text style={{ color: isSelected ? "#fff" : "#000" }}>
                        {item.TenMonHoc}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            <TouchableOpacity style={styles.btn} onPress={handleCreate}>
              <Text style={{ color: "#fff" }}>TẠO</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.close}>Đóng</Text>
            </TouchableOpacity>

          </View>
        </Modal>

      </View>
    </MainLayout>
  );
}
// =====================
// STYLE
// =====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f2f4f8",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  topBar: {
    flexDirection: "row",
    marginBottom: 10,
  },

  search: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    backgroundColor: "#fff",
  },

  addBtn: {
    backgroundColor: "#2196F3",
    justifyContent: "center",
    paddingHorizontal: 15,
    borderRadius: 8,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 3,
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },

  row: {
    flexDirection: "row",
    marginTop: 10,
  },

  editBtn: {
    backgroundColor: "#f39c12",
    padding: 8,
    borderRadius: 8,
    marginRight: 10,
  },

  deleteBtn: {
    backgroundColor: "#e74c3c",
    padding: 8,
    borderRadius: 8,
  },

  modal: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f9f9f9",
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },

  btn: {
    backgroundColor: "#2196F3",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  close: {
    marginTop: 15,
    color: "red",
    textAlign: "center",
  },
  label: {
  fontWeight: "bold",
  marginTop: 10,
  marginBottom: 5,
},

rowSelect: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 10,
},

levelBtn: {
  flex: 1,
  padding: 10,
  borderWidth: 1,
  borderColor: "#ccc",
  marginHorizontal: 3,
  borderRadius: 8,
  alignItems: "center",
  backgroundColor: "#fff",
},

levelBtnActive: {
  backgroundColor: "#2196F3",
  borderColor: "#2196F3",
},
dropdownBox: {
  backgroundColor: "#fff",
  borderWidth: 1,
  borderColor: "#ddd",
  borderRadius: 10,
  padding: 10,
  marginBottom: 10,
},

dropdownItem: {
  padding: 10,
  borderRadius: 8,
  marginBottom: 5,
  backgroundColor: "#f5f5f5",
},

dropdownActive: {
  backgroundColor: "#2196F3",
},
dropdownHeader: {
  backgroundColor: "#fff",
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 8,
  padding: 12,
  marginBottom: 10,
},


//dap an
answerRow: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 8,
},

answerInput: {
  flex: 1,
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 8,
  padding: 8,
  marginHorizontal: 5,
  backgroundColor: "#fff",
},

correctBtn: {
  backgroundColor: "#bbb",
  padding: 8,
  borderRadius: 6,
},

correctBtnActive: {
  backgroundColor: "#2ecc71",
},

});