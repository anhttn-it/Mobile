import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import { ScrollView } from "react-native";
import { getCauHoiByMon } from "../../api/dethi";
import { createDeThi, getMonHocByUser, getNhomByMon } from "../../api/dethi";
import { AuthContext } from "../../context/AuthContext";

export default function CreateDeThiScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [cauHoiList, setCauHoiList] = useState([]);
    const [selectedCauHoi, setSelectedCauHoi] = useState([]);
  // ================= STATE =================
  const [tenDe, setTenDe] = useState("");
  const [kieu, setKieu] = useState("auto");

  const [monHocList, setMonHocList] = useState([]);
  const [selectedMon, setSelectedMon] = useState(null);
  const [openMon, setOpenMon] = useState(false);

  const [nhomList, setNhomList] = useState([]);
  const [selectedNhom, setSelectedNhom] = useState(null);
  const [openNhom, setOpenNhom] = useState(false);

  const [soDe, setSoDe] = useState("1");
  const [soTB, setSoTB] = useState("1");
  const [soKho, setSoKho] = useState("1");


  const loadCauHoi = async (maMon) => {
  const res = await getCauHoiByMon(maMon, user.userId);
  setCauHoiList(res);
};

  // ================= LOAD =================
  useEffect(() => {
    if (user?.userId) loadMonHoc();
  }, [user]);

  const loadMonHoc = async () => {
    const res = await getMonHocByUser(user.userId);
    setMonHocList(res);
  };

  const loadNhom = async (maMon) => {
    const res = await getNhomByMon(maMon, user.userId);
    setNhomList(res);
  };

  // ================= CREATE =================
  const handleCreate = async () => {
    try {
      if (!tenDe || !selectedMon) {
        Alert.alert("Lỗi", "Nhập đầy đủ thông tin");
        return;
      }

      const payload = {
        TenDe: tenDe,
        MaMonHoc: selectedMon,
        userId: user.userId,
        kieu: kieu,
        MaNhom: selectedNhom,

        SoCauDe: parseInt(soDe),
        SoCauTrungBinh: parseInt(soTB),
        SoCauKho: parseInt(soKho),

        selectedCauHoi: selectedCauHoi, // 👈 THÊM DÒNG NÀY
        };

      console.log("📤 CREATE:", payload);

      await createDeThi(payload);

      Alert.alert("Thành công", "Tạo đề thành công");
      navigation.goBack();
    } catch (err) {
      Alert.alert("Lỗi", err.message);
    }
  };

  // ================= UI =================
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Tạo đề thi</Text>

        <View style={{ width: 30 }} />
        </View>

      {/* TÊN ĐỀ */}
      <TextInput
        placeholder="Tên đề"
        value={tenDe}
        onChangeText={setTenDe}
        style={styles.input}
      />

      {/* LOẠI ĐỀ */}
      <Text style={styles.label}>Loại đề</Text>
      <View style={styles.row}>
        {["auto", "manual"].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeBtn,
              kieu === type && styles.typeActive,
            ]}
            onPress={() => setKieu(type)}
          >
            <Text style={{ color: kieu === type ? "#fff" : "#000" }}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* MÔN HỌC */}
      <Text style={styles.label}>Môn học</Text>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setOpenMon(!openMon)}
      >
        <Text>
          {selectedMon
            ? monHocList.find(x => x.MaMonHoc === selectedMon)?.TenMonHoc
            : "Chọn môn học"}
        </Text>
      </TouchableOpacity>

      {openMon &&
        monHocList.map((m) => (
          <TouchableOpacity
            key={m.MaMonHoc}
            style={styles.item}
            onPress={() => {
              setSelectedMon(m.MaMonHoc);
              setOpenMon(false);
              loadNhom(m.MaMonHoc);
              loadCauHoi(m.MaMonHoc);
            }}
          >
            <Text>{m.TenMonHoc}</Text>
          </TouchableOpacity>
        ))}

      {/* NHÓM */}
      <Text style={styles.label}>Nhóm</Text>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setOpenNhom(!openNhom)}
      >
        <Text>
          {selectedNhom
            ? nhomList.find(x => x.MaNhom === selectedNhom)?.TenNhom
            : "Chọn nhóm"}
        </Text>
      </TouchableOpacity>

      {openNhom &&
        nhomList.map((n) => (
          <TouchableOpacity
            key={n.MaNhom}
            style={styles.item}
            onPress={() => {
              setSelectedNhom(n.MaNhom);
              setOpenNhom(false);
            }}
          >
            <Text>{n.TenNhom}</Text>
          </TouchableOpacity>
        ))}

      {/* AUTO */}
      {kieu === "auto" && (
        <View style={styles.box}>
            <Text style={styles.sectionTitle}>📊 Cấu hình số câu</Text>

            {/* DỄ */}
            <View style={styles.rowInput}>
            <Text style={styles.tagEasy}>Dễ</Text>
            <TextInput
                value={soDe}
                onChangeText={setSoDe}
                keyboardType="numeric"
                style={styles.inputSmall}
                placeholder="0"
            />
            </View>

            {/* TRUNG BÌNH */}
            <View style={styles.rowInput}>
            <Text style={styles.tagMedium}>TB</Text>
            <TextInput
                value={soTB}
                onChangeText={setSoTB}
                keyboardType="numeric"
                style={styles.inputSmall}
                placeholder="0"
            />
            </View>

            {/* KHÓ */}
            <View style={styles.rowInput}>
            <Text style={styles.tagHard}>Khó</Text>
            <TextInput
                value={soKho}
                onChangeText={setSoKho}
                keyboardType="numeric"
                style={styles.inputSmall}
                placeholder="0"
            />
            </View>
        </View>
        )}


        {kieu === "manual" && (
        <View style={styles.box}>
            <Text style={styles.sectionTitle}>📚 Chọn câu hỏi</Text>

            {cauHoiList.map((q) => {
            const checked = selectedCauHoi.includes(q.MaCauHoi);

            return (
                <TouchableOpacity
                key={q.MaCauHoi}
                style={[
                    styles.questionItem,
                    checked && styles.questionChecked,
                ]}
                onPress={() => {
                    if (checked) {
                    setSelectedCauHoi(selectedCauHoi.filter(id => id !== q.MaCauHoi));
                    } else {
                    setSelectedCauHoi([...selectedCauHoi, q.MaCauHoi]);
                    }
                }}
                >
                <Text>{q.NoiDung}</Text>
                <Text style={{ fontSize: 12 }}>
                    Mức: {q.DoKho === 1 ? "Dễ" : q.DoKho === 2 ? "TB" : "Khó"}
                </Text>
                </TouchableOpacity>
            );
            })}
        </View>
        )}


      <TouchableOpacity style={styles.btn} onPress={handleCreate}>
        <Text style={{ color: "#fff" }}>TẠO ĐỀ</Text>
      </TouchableOpacity>
    </ScrollView>
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

  label: {
    marginTop: 10,
    fontWeight: "bold",
  },

  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },

  dropdown: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginTop: 5,
  },

  item: {
    padding: 10,
    backgroundColor: "#eee",
    marginVertical: 2,
    borderRadius: 6,
  },

  row: {
    flexDirection: "row",
  },

  typeBtn: {
    padding: 10,
    borderWidth: 1,
    marginRight: 5,
    borderRadius: 6,
  },

  typeActive: {
    backgroundColor: "#2196F3",
  },

  btn: {
    backgroundColor: "#2ecc71",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },

  box: {
  backgroundColor: "#fff",
  padding: 15,
  borderRadius: 10,
  marginTop: 10,
  elevation: 3,
},

sectionTitle: {
  fontWeight: "bold",
  fontSize: 16,
  marginBottom: 10,
},

rowInput: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 10,
},

inputSmall: {
  flex: 1,
  backgroundColor: "#f5f5f5",
  padding: 10,
  borderRadius: 8,
  marginLeft: 10,
},

tagEasy: {
  backgroundColor: "#2ecc71",
  color: "#fff",
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 6,
  fontWeight: "bold",
},

tagMedium: {
  backgroundColor: "#f39c12",
  color: "#fff",
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 6,
  fontWeight: "bold",
},

tagHard: {
  backgroundColor: "#e74c3c",
  color: "#fff",
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 6,
  fontWeight: "bold",
},
questionItem: {
  padding: 10,
  borderRadius: 8,
  backgroundColor: "#eee",
  marginBottom: 8,
},

questionChecked: {
  backgroundColor: "#c8f7c5",
},


header: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 15,
  marginTop: 40,
},

backIcon: {
  fontSize: 26,
  fontWeight: "bold",
  paddingHorizontal: 10,
},

title: {
  flex: 1,
  fontSize: 20,
  fontWeight: "bold",
  textAlign: "center",
},
});