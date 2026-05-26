import React, {
  useState,
  useEffect,
  useContext,
} from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import {
  createDeThi,
  getMonHocByUser,
  getNhomByMon,
  getCauHoiByMon,
} from "../../api/dethi";

import { AuthContext } from "../../context/AuthContext";

export default function CreateDeThiScreen({
  navigation,
}) {
  const { user } =
    useContext(AuthContext);

  // ================= STATE =================
  const [loading, setLoading] =
    useState(false);

  const [tenDe, setTenDe] =
    useState("");

  const [kieu, setKieu] =
    useState("auto");

  // ===== MÔN =====
  const [monHocList, setMonHocList] =
    useState([]);

  const [selectedMon, setSelectedMon] =
    useState(null);

  const [openMon, setOpenMon] =
    useState(false);

  // ===== NHÓM =====
  const [nhomList, setNhomList] =
    useState([]);

  const [
    selectedNhom,
    setSelectedNhom,
  ] = useState(null);

  const [openNhom, setOpenNhom] =
    useState(false);

  // ===== AUTO =====
  const [soDe, setSoDe] =
    useState("1");

  const [soTB, setSoTB] =
    useState("1");

  const [soKho, setSoKho] =
    useState("1");

  // ===== MANUAL =====
  const [cauHoiList, setCauHoiList] =
    useState([]);

  const [
    selectedCauHoi,
    setSelectedCauHoi,
  ] = useState([]);

  // ===== THỜI GIAN =====
  const [
    thoiGianThi,
    setThoiGianThi,
  ] = useState("15");

  const [
    thoiGianBatDau,
    setThoiGianBatDau,
  ] = useState("");

  const [
    thoiGianKetThuc,
    setThoiGianKetThuc,
  ] = useState("");

  const [
    soLanLamToiDa,
    setSoLanLamToiDa,
  ] = useState("1");

  // ================= LOAD =================
  useEffect(() => {
    if (user?.userId) {
      loadMonHoc();
    }
  }, [user]);

  // ================= LOAD MÔN =================
  const loadMonHoc = async () => {
    try {
      setLoading(true);

      const res =
        await getMonHocByUser(
          user.userId
        );

      setMonHocList(res);
    } catch (err) {
      Alert.alert(
        "Lỗi",
        err.message
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= LOAD NHÓM =================
  const loadNhom = async (maMon) => {
    try {
      const res =
        await getNhomByMon(
          maMon,
          user.userId
        );

      setNhomList(res);
    } catch (err) {
      Alert.alert(
        "Lỗi",
        err.message
      );
    }
  };

  // ================= LOAD CÂU HỎI =================
  const loadCauHoi = async (
    maMon
  ) => {
    try {
      const res =
        await getCauHoiByMon(
          maMon,
          user.userId
        );

      setCauHoiList(res);
    } catch (err) {
      Alert.alert(
        "Lỗi",
        err.message
      );
    }
  };

  // ================= CHECKBOX =================
  const toggleQuestion = (id) => {
    if (
      selectedCauHoi.includes(id)
    ) {
      setSelectedCauHoi(
        selectedCauHoi.filter(
          (x) => x !== id
        )
      );
    } else {
      setSelectedCauHoi([
        ...selectedCauHoi,
        id,
      ]);
    }
  };

  // ================= CREATE =================
  const handleCreate = async () => {
    try {
      // ===== VALIDATE =====
      if (!tenDe.trim()) {
        Alert.alert(
          "Lỗi",
          "Nhập tên đề"
        );
        return;
      }

      if (!selectedMon) {
        Alert.alert(
          "Lỗi",
          "Chọn môn học"
        );
        return;
      }

      if (
        !thoiGianBatDau
      ) {
        Alert.alert(
          "Lỗi",
          "Nhập thời gian bắt đầu"
        );
        return;
      }

      if (
        !thoiGianKetThuc
      ) {
        Alert.alert(
          "Lỗi",
          "Nhập thời gian kết thúc"
        );
        return;
      }

      if (
        kieu === "manual" &&
        selectedCauHoi.length === 0
      ) {
        Alert.alert(
          "Lỗi",
          "Chọn ít nhất 1 câu hỏi"
        );
        return;
      }

      // ===== PAYLOAD =====
      const payload = {
        TenDe: tenDe,

        MaMonHoc: selectedMon,

        UserId: user.userId,

        Kieu: kieu,

        MaNhom: selectedNhom,

        SoCauDe: parseInt(
          soDe || 0
        ),

        SoCauTrungBinh:
          parseInt(
            soTB || 0
          ),

        SoCauKho: parseInt(
          soKho || 0
        ),

        SelectedCauHoi:
          selectedCauHoi,

        ThoiGianThi:
          parseInt(
            thoiGianThi || 0
          ),

        ThoiGianBatDau:
          thoiGianBatDau,

        ThoiGianKetThuc:
          thoiGianKetThuc,

        SoLanLamToiDa:
          parseInt(
            soLanLamToiDa || 1
          ),
      };

      console.log(
        "📤 CREATE:",
        payload
      );

      await createDeThi(payload);

      Alert.alert(
        "Thành công",
        "Tạo đề thành công"
      );

      navigation.goBack();
    } catch (err) {
      Alert.alert(
        "Lỗi",
        err.message
      );
    }
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // ================= UI =================
  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={
        false
      }
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() =>
            navigation.goBack()
          }
        >
          <Text style={styles.back}>
            ←
          </Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          Tạo đề thi
        </Text>

        <View
          style={{ width: 30 }}
        />
      </View>

      {/* TÊN ĐỀ */}
      <Text style={styles.label}>
        Tên đề
      </Text>

      <TextInput
        placeholder="Nhập tên đề"
        value={tenDe}
        onChangeText={setTenDe}
        style={styles.input}
      />

      {/* LOẠI */}
      <Text style={styles.label}>
        Loại đề
      </Text>

      <View style={styles.row}>
        <TouchableOpacity
          style={[
            styles.typeBtn,
            kieu === "auto" &&
              styles.typeActive,
          ]}
          onPress={() =>
            setKieu("auto")
          }
        >
          <Text
            style={
              kieu === "auto"
                ? styles.activeText
                : styles.normalText
            }
          >
            Tự động
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeBtn,
            kieu === "manual" &&
              styles.typeActive,
          ]}
          onPress={() =>
            setKieu("manual")
          }
        >
          <Text
            style={
              kieu === "manual"
                ? styles.activeText
                : styles.normalText
            }
          >
            Thủ công
          </Text>
        </TouchableOpacity>
      </View>

      {/* MÔN */}
      <Text style={styles.label}>
        Môn học
      </Text>

      <TouchableOpacity
        style={styles.dropdown}
        onPress={() =>
          setOpenMon(!openMon)
        }
      >
        <Text>
          {selectedMon
            ? monHocList.find(
                (x) =>
                  x.MaMonHoc ===
                  selectedMon
              )?.TenMonHoc
            : "Chọn môn học"}
        </Text>
      </TouchableOpacity>

      {openMon &&
        monHocList.map((m) => (
          <TouchableOpacity
            key={m.MaMonHoc}
            style={styles.item}
            onPress={() => {
              setSelectedMon(
                m.MaMonHoc
              );

              setOpenMon(false);

              setSelectedCauHoi(
                []
              );

              loadNhom(
                m.MaMonHoc
              );

              loadCauHoi(
                m.MaMonHoc
              );
            }}
          >
            <Text>
              {m.TenMonHoc}
            </Text>
          </TouchableOpacity>
        ))}

      {/* NHÓM */}
      <Text style={styles.label}>
        Nhóm
      </Text>

      <TouchableOpacity
        style={styles.dropdown}
        onPress={() =>
          setOpenNhom(
            !openNhom
          )
        }
      >
        <Text>
          {selectedNhom
            ? nhomList.find(
                (x) =>
                  x.MaNhom ===
                  selectedNhom
              )?.TenNhom
            : "Chọn nhóm"}
        </Text>
      </TouchableOpacity>

      {openNhom &&
        nhomList.map((n) => (
          <TouchableOpacity
            key={n.MaNhom}
            style={styles.item}
            onPress={() => {
              setSelectedNhom(
                n.MaNhom
              );

              setOpenNhom(
                false
              );
            }}
          >
            <Text>
              {n.TenNhom}
            </Text>
          </TouchableOpacity>
        ))}

      {/* THỜI GIAN */}
      <Text style={styles.label}>
        Thời gian thi
        (phút)
      </Text>

      <TextInput
        value={thoiGianThi}
        onChangeText={
          setThoiGianThi
        }
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>
        Thời gian bắt đầu
      </Text>

      <TextInput
        value={
          thoiGianBatDau
        }
        onChangeText={
          setThoiGianBatDau
        }
        placeholder="2026-05-25T10:00:00"
        style={styles.input}
      />

      <Text style={styles.label}>
        Thời gian kết thúc
      </Text>

      <TextInput
        value={
          thoiGianKetThuc
        }
        onChangeText={
          setThoiGianKetThuc
        }
        placeholder="2026-05-25T11:00:00"
        style={styles.input}
      />

      <Text style={styles.label}>
        Số lần làm tối đa
      </Text>

      <TextInput
        value={
          soLanLamToiDa
        }
        onChangeText={
          setSoLanLamToiDa
        }
        keyboardType="numeric"
        style={styles.input}
      />

      {/* AUTO */}
      {kieu === "auto" && (
        <View style={styles.box}>
          <Text
            style={
              styles.sectionTitle
            }
          >
            📊 Cấu hình số câu
          </Text>

          <View
            style={
              styles.rowInput
            }
          >
            <Text
              style={
                styles.easy
              }
            >
              Dễ
            </Text>

            <TextInput
              value={soDe}
              onChangeText={
                setSoDe
              }
              keyboardType="numeric"
              style={
                styles.inputSmall
              }
            />
          </View>

          <View
            style={
              styles.rowInput
            }
          >
            <Text
              style={
                styles.medium
              }
            >
              TB
            </Text>

            <TextInput
              value={soTB}
              onChangeText={
                setSoTB
              }
              keyboardType="numeric"
              style={
                styles.inputSmall
              }
            />
          </View>

          <View
            style={
              styles.rowInput
            }
          >
            <Text
              style={
                styles.hard
              }
            >
              Khó
            </Text>

            <TextInput
              value={soKho}
              onChangeText={
                setSoKho
              }
              keyboardType="numeric"
              style={
                styles.inputSmall
              }
            />
          </View>
        </View>
      )}

      {/* MANUAL */}
      {kieu === "manual" && (
        <View style={styles.box}>
          <Text
            style={
              styles.sectionTitle
            }
          >
            📚 Chọn câu hỏi
          </Text>

          {cauHoiList.map(
            (q) => {
              const checked =
                selectedCauHoi.includes(
                  q.MaCauHoi
                );

              return (
                <TouchableOpacity
                  key={
                    q.MaCauHoi
                  }
                  style={[
                    styles.questionItem,
                    checked &&
                      styles.questionChecked,
                  ]}
                  onPress={() =>
                    toggleQuestion(
                      q.MaCauHoi
                    )
                  }
                >
                  <Text
                    style={
                      styles.questionText
                    }
                  >
                    {q.NoiDung}
                  </Text>

                  <Text
                    style={
                      styles.level
                    }
                  >
                    Độ khó:
                    {" "}
                    {q.DoKho ===
                    1
                      ? "Dễ"
                      : q.DoKho ===
                        2
                      ? "TB"
                      : "Khó"}
                  </Text>
                </TouchableOpacity>
              );
            }
          )}
        </View>
      )}

      {/* BUTTON */}
      <TouchableOpacity
        style={styles.btn}
        onPress={handleCreate}
      >
        <Text style={styles.btnText}>
          TẠO ĐỀ THI
        </Text>
      </TouchableOpacity>

      <View
        style={{ height: 40 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      "#f2f4f8",
    paddingHorizontal: 20,
  },

  center: {
    flex: 1,
    justifyContent:
      "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "space-between",
    marginTop: 45,
    marginBottom: 20,
  },

  back: {
    fontSize: 28,
    fontWeight: "bold",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
  },

  label: {
    fontWeight: "bold",
    marginBottom: 6,
    marginTop: 12,
    color: "#333",
  },

  input: {
    backgroundColor:
      "#fff",
    borderRadius: 12,
    padding: 14,
    elevation: 2,
  },

  dropdown: {
    backgroundColor:
      "#fff",
    borderRadius: 12,
    padding: 14,
    elevation: 2,
  },

  item: {
    backgroundColor:
      "#fff",
    padding: 12,
    borderRadius: 10,
    marginTop: 5,
  },

  row: {
    flexDirection: "row",
  },

  typeBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#2196F3",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 10,
  },

  typeActive: {
    backgroundColor:
      "#2196F3",
  },

  activeText: {
    color: "#fff",
    fontWeight: "bold",
  },

  normalText: {
    color: "#2196F3",
    fontWeight: "bold",
  },

  box: {
    backgroundColor:
      "#fff",
    borderRadius: 15,
    padding: 15,
    marginTop: 15,
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
  },

  rowInput: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  inputSmall: {
    flex: 1,
    backgroundColor:
      "#f5f5f5",
    borderRadius: 10,
    padding: 12,
    marginLeft: 10,
  },

  easy: {
    backgroundColor:
      "#2ecc71",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    fontWeight: "bold",
  },

  medium: {
    backgroundColor:
      "#f39c12",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    fontWeight: "bold",
  },

  hard: {
    backgroundColor:
      "#e74c3c",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    fontWeight: "bold",
  },

  questionItem: {
    backgroundColor:
      "#f8f9fa",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  questionChecked: {
    backgroundColor:
      "#d4edda",
    borderWidth: 1,
    borderColor: "#28a745",
  },

  questionText: {
    fontWeight: "bold",
    marginBottom: 5,
  },

  level: {
    color: "#666",
    fontSize: 12,
  },

  btn: {
    backgroundColor:
      "#2ecc71",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 20,
    elevation: 3,
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});