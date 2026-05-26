import React, {
  useEffect,
  useState,
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
  getDeThiDetail,
  updateDeThi,
} from "../../api/dethi";

import { AuthContext } from "../../context/AuthContext";

export default function EditDeThiScreen({
  route,
  navigation,
}) {
  const { id } = route.params;

  const { user } =
    useContext(AuthContext);

  // ================= STATE =================
  const [loading, setLoading] =
    useState(true);

  // ===== FORM =====
  const [tenDe, setTenDe] =
    useState("");

  const [soDe, setSoDe] =
    useState("0");

  const [soTB, setSoTB] =
    useState("0");

  const [soKho, setSoKho] =
    useState("0");

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
const [selectedLop, setSelectedLop] =
  useState(null);
  // ================= LOAD DETAIL =================
  const loadDetail = async () => {
    try {
      setLoading(true);

      const res =
        await getDeThiDetail(
          id,
          user.userId
        );

      // ===== INFO =====
      setTenDe(res.TenDe || "");

      setSelectedLop(
  (res.LopDaChon || []).map(
    (x) => x.MaLop
  )
);

      // ===== TIME =====
      setThoiGianThi(
        String(
          res.ThoiGianThi || 15
        )
      );

      setThoiGianBatDau(
        res.ThoiGianBatDau || ""
      );

      setThoiGianKetThuc(
        res.ThoiGianKetThuc || ""
      );

      setSoLanLamToiDa(
        String(
          res.SoLanLamToiDa || 1
        )
      );

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
      loadDetail();
    }
  }, []);

  // ================= UPDATE =================
  const handleUpdate =
    async () => {
      try {
        if (!tenDe.trim()) {
          Alert.alert(
            "Lỗi",
            "Nhập tên đề"
          );
          return;
        }

        const payload = {
          MaDe: id,

          TenDe: tenDe,

          MaNhom: selectedLop,

          ThoiGianThi:
            parseInt(
              thoiGianThi || 15
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
          "📤 UPDATE:",
          payload
        );

        await updateDeThi(
          payload
        );

        Alert.alert(
          "Thành công",
          "Cập nhật đề thi thành công"
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
          ✏️ Sửa đề thi
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
        style={styles.input}
        value={tenDe}
        onChangeText={setTenDe}
        placeholder="Nhập tên đề"
      />

      {/* THỜI GIAN */}
      <View style={styles.box}>
        <Text
          style={
            styles.sectionTitle
          }
        >
          ⏰ Thời gian
        </Text>

        <Text
          style={styles.label}
        >
          Thời gian thi (phút)
        </Text>

        <TextInput
          value={
            thoiGianThi
          }
          onChangeText={
            setThoiGianThi
          }
          keyboardType="numeric"
          style={styles.input}
        />

        <Text
          style={styles.label}
        >
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

        <Text
          style={styles.label}
        >
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

        <Text
          style={styles.label}
        >
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
      </View>

      {/* BUTTON */}
      <TouchableOpacity
        style={styles.btn}
        onPress={handleUpdate}
      >
        <Text style={styles.btnText}>
          CẬP NHẬT
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
    paddingHorizontal: 15,
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
    marginTop: 10,
    marginBottom: 5,
    fontWeight: "bold",
    color: "#333",
  },

  input: {
    backgroundColor:
      "#fff",
    borderRadius: 12,
    padding: 14,
    marginTop: 5,
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

  btn: {
    backgroundColor:
      "#2196F3",
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