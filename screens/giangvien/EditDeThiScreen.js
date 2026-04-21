import React, { useEffect, useState, useContext } from "react";
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

import { AuthContext } from "../../context/AuthContext";
import {
  getDeThiDetail,
  updateDeThi,
  getCauHoiByMon,
} from "../../api/dethi";

export default function EditDeThiScreen({ route, navigation }) {
  const { id } = route.params;
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);

  // ===== FORM =====
  const [tenDe, setTenDe] = useState("");
  const [soDe, setSoDe] = useState("0");
  const [soTB, setSoTB] = useState("0");
  const [soKho, setSoKho] = useState("0");

  const [selectedCauHoi, setSelectedCauHoi] = useState([]);
  const [cauHoiList, setCauHoiList] = useState([]);

  const [maMonHoc, setMaMonHoc] = useState(null);

  // ================= LOAD DETAIL =================
  const loadDetail = async () => {
    try {
      setLoading(true);

      const res = await getDeThiDetail(id, user.userId);

      setTenDe(res.TenDe);
      setSoDe(String(res.SoCauDe));
      setSoTB(String(res.SoCauTrungBinh));
      setSoKho(String(res.SoCauKho));

      setMaMonHoc(res.MaMonHoc);

      setSelectedCauHoi(res.cauHoi.map(x => Number(x.MaCauHoi)));

      const ch = await getCauHoiByMon(res.MaMonHoc, user.userId);
      setCauHoiList(ch);

    } catch (err) {
      Alert.alert("Lỗi", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, []);

  // ================= UPDATE =================
  const handleUpdate = async () => {
    try {
      const payload = {
        MaDe: id,
        TenDe: tenDe,
        SoCauDe: parseInt(soDe),
        SoCauTrungBinh: parseInt(soTB),
        SoCauKho: parseInt(soKho),

        selectedCauHoi: selectedCauHoi, // 👈 quan trọng
      };

      await updateDeThi(payload);

      Alert.alert("Thành công", "Cập nhật đề thi thành công");
      navigation.goBack();

    } catch (err) {
      Alert.alert("Lỗi", err.message);
    }
  };

  // ================= UI =================
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>✏️ Sửa đề thi</Text>

      {/* TÊN ĐỀ */}
      <TextInput
        style={styles.input}
        value={tenDe}
        onChangeText={setTenDe}
        placeholder="Tên đề"
      />

      {/* SỐ CÂU */}
      <View style={styles.box}>
        <Text>Dễ</Text>
        <TextInput
          value={soDe}
          onChangeText={setSoDe}
          keyboardType="numeric"
          style={styles.input}
        />

        <Text>Trung bình</Text>
        <TextInput
          value={soTB}
          onChangeText={setSoTB}
          keyboardType="numeric"
          style={styles.input}
        />

        <Text>Khó</Text>
        <TextInput
          value={soKho}
          onChangeText={setSoKho}
          keyboardType="numeric"
          style={styles.input}
        />
      </View>

      {/* CÂU HỎI */}
      <Text style={styles.section}>Câu hỏi</Text>

      {cauHoiList.map((q) => {
        const checked = selectedCauHoi.includes(Number(q.MaCauHoi));

        return (
          <TouchableOpacity
            key={q.MaCauHoi}
            style={[styles.question, checked && styles.questionActive]}
            onPress={() => {
            const id = Number(q.MaCauHoi);

            if (selectedCauHoi.includes(id)) {
                setSelectedCauHoi(selectedCauHoi.filter(x => x !== id));
            } else {
                setSelectedCauHoi([...selectedCauHoi, id]);
            }
            }}
          >
            <Text>{q.NoiDung}</Text>
          </TouchableOpacity>
        );
      })}

      {/* BUTTON */}
      <TouchableOpacity style={styles.btn} onPress={handleUpdate}>
        <Text style={{ color: "#fff" }}>CẬP NHẬT</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },

  input: {
    backgroundColor: "#eee",
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
  },

  box: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },

  section: {
    fontWeight: "bold",
    marginTop: 10,
  },

  question: {
    padding: 10,
    backgroundColor: "#eee",
    marginVertical: 5,
    borderRadius: 8,
  },

  questionActive: {
    backgroundColor: "#c8f7c5",
  },

  btn: {
    backgroundColor: "#2196F3",
    padding: 12,
    marginTop: 15,
    borderRadius: 8,
    alignItems: "center",
  },
});