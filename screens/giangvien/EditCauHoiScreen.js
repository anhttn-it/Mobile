import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";

import { AuthContext } from "../../context/AuthContext";
import { getCauHoiDetail, updateCauHoi } from "../../api/cauhoi";

export default function EditCauHoi({ route, navigation }) {
  const { id } = route.params;
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);

  const [noiDung, setNoiDung] = useState("");
  const [doKho, setDoKho] = useState("1");
  const [maMonHoc, setMaMonHoc] = useState(null);

  const [dapAn, setDapAn] = useState(["", "", "", ""]);
  const [dapAnDung, setDapAnDung] = useState(0);

  // ================= LOAD DETAIL =================
  const loadDetail = async () => {
    try {
      const res = await getCauHoiDetail(id, user.userId);

      setNoiDung(res.NoiDung);
      setDoKho(res.DoKho.toString());
      setMaMonHoc(res.MaMonHoc);

      // giả sử API trả về answers
      // ✅ ĐÚNG THEO API CỦA BẠN
      if (res.dapAn) {
        setDapAn(res.dapAn);
      }

      if (res.dapAnDung !== undefined) {
        setDapAnDung(res.dapAnDung);
      }

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
        MaCauHoi: id,
        NoiDung: noiDung,
        DoKho: parseInt(doKho),
        MaMonHoc: maMonHoc,
        dapAn: dapAn,
        dapAnDung: dapAnDung,
        userId: user.userId,
      };

      await updateCauHoi(payload);

      Alert.alert("Thành công", "Cập nhật thành công");
      navigation.goBack();

    } catch (err) {
      Alert.alert("Lỗi", err.message);
    }
  };

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <View style={styles.container}>

      <Text style={styles.title}>✏️ Sửa câu hỏi</Text>

      <TextInput
        value={noiDung}
        onChangeText={setNoiDung}
        placeholder="Nội dung"
        style={styles.input}
      />

      {/* ĐỘ KHÓ */}
      <View style={styles.row}>
        {["1", "2", "3"].map((lv) => (
          <TouchableOpacity
            key={lv}
            style={[
              styles.levelBtn,
              doKho === lv && styles.levelActive,
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
              dapAnDung === index && styles.correctActive,
            ]}
          >
            <Text style={{ color: "#fff" }}>✔</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.btn} onPress={handleUpdate}>
        <Text style={{ color: "#fff" }}>CẬP NHẬT</Text>
      </TouchableOpacity>

    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f2f4f8",
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },

  row: {
    flexDirection: "row",
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

  levelActive: {
    backgroundColor: "#2196F3",
  },

  label: {
    fontWeight: "bold",
    marginBottom: 5,
  },

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

  correctActive: {
    backgroundColor: "#2ecc71",
  },

  btn: {
    backgroundColor: "#2196F3",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
});