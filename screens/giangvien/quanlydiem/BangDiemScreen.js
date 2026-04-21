import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
} from "react-native";

import {
  getDeThiList,
  getDaNop,
  getChuaNop,
  exportCSVUrl
} from "../../../api/dethi";

import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

import { AuthContext } from "../../../context/AuthContext";

export default function BangDiemScreen({ route, navigation }) {
  const { user } = useContext(AuthContext);
  const { tenNhom } = route.params;

  const [deThi, setDeThi] = useState([]);
  const [daNop, setDaNop] = useState([]);
  const [chuaNop, setChuaNop] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  // ================= LOAD =================
  const loadDeThi = async () => {
    try {
      if (!user?.userId) return;

      const res = await getDeThiList(user.userId);
      const list = res?.data || res || [];

      const filtered = list.filter(
        (x) => (x.TenNhom || "") === tenNhom
      );

      setDeThi(filtered);
    } catch (err) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    loadDeThi();
  }, [tenNhom, user]);

  // ================= SELECT ĐỀ =================
  const selectDe = async (maDe) => {
    setSelected(maDe);

    try {
      const da = await getDaNop(maDe);
      const chua = await getChuaNop(maDe);

      setDaNop(da?.data || da || []);
      setChuaNop(chua?.data || chua || []);
    } catch (err) {
      console.log(err.message);
    }
  };

  // ================= EXPORT =================
  const downloadCSV = async (maDe) => {
    try {
      const url = exportCSVUrl(maDe);
      const fileUri = FileSystem.documentDirectory + `bangdiem_${maDe}.csv`;

      const result = await FileSystem.downloadAsync(url, fileUri);

      if (result.status === 200) {
        await Sharing.shareAsync(result.uri);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // ================= STATS =================
  const total = daNop.length + chuaNop.length;
  const percent = total > 0 ? Math.round((daNop.length / total) * 100) : 0;

  // ================= FILTER =================
  const filteredData = deThi.filter(item =>
    item.TenDe?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Quay lại</Text>
        </TouchableOpacity>

        <Text style={styles.title}>📊 {tenNhom}</Text>
      </View>

      {/* SEARCH */}
      <TextInput
        placeholder="🔍 Tìm đề thi..."
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      {/* LIST */}
      <FlatList
        data={filteredData}
        keyExtractor={(i, idx) => i.MaDe?.toString() || idx.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => selectDe(item.MaDe)}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>📝 {item.TenDe}</Text>
            <Text style={styles.sub}>Lớp: {item.TenNhom}</Text>
          </TouchableOpacity>
        )}
      />

      {/* DETAIL */}
      {selected && (
        <View style={styles.detail}>

          {/* EXPORT nhỏ lại */}
          <TouchableOpacity
            onPress={() => downloadCSV(selected)}
            style={styles.export}
          >
            <Text style={{ color: "#fff", fontSize: 13 }}>
              📥 Export CSV
            </Text>
          </TouchableOpacity>

          {/* STATS */}
          <View style={styles.stats}>
            <Text>📌 Tổng: {total}</Text>
            <Text>✅ Đã nộp: {daNop.length}</Text>
            <Text>❌ Chưa nộp: {chuaNop.length}</Text>
            <Text style={{ fontWeight: "bold" }}>
              📊 Tỉ lệ: {percent}%
            </Text>
          </View>

          {/* ĐÃ NỘP */}
          <Text style={styles.section}>✅ Đã nộp</Text>

          {daNop.length === 0 ? (
            <Text style={styles.empty}>Không có dữ liệu</Text>
          ) : (
            daNop.map((i, idx) => (
              <View key={idx} style={styles.item}>
                <Text>{i.HoTen} - {i.DiemThi ?? 0} điểm</Text>
              </View>
            ))
          )}

          {/* CHƯA NỘP */}
          <Text style={styles.section}>❌ Chưa nộp</Text>

          {chuaNop.length === 0 ? (
            <Text style={styles.empty}>Không có dữ liệu</Text>
          ) : (
            chuaNop.map((i, idx) => (
              <View key={idx} style={styles.item}>
                <Text>{i.HoTen}</Text>
              </View>
            ))
          )}

        </View>
      )}
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#f4f6f9",
    paddingHorizontal: 15,
  },

  header: {
    marginTop: 10,
  },

  back: {
    color: "#2196F3",
    fontWeight: "bold",
    marginBottom: 8,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
  },

  search: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
    elevation: 2,
  },

  card: {
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
  },

  cardTitle: {
    fontWeight: "bold",
  },

  sub: {
    color: "#666",
  },

  detail: {
    marginTop: 10,
  },

  export: {
    backgroundColor: "#27ae60",
    padding: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 10,
  },

  stats: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },

  section: {
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 5,
  },

  item: {
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 6,
    marginBottom: 5,
  },

  empty: {
    color: "#999",
    fontStyle: "italic",
  },
};