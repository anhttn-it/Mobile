import React, { useEffect, useState, useContext, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert
} from "react-native";

import { AuthContext } from "../../context/AuthContext";
import { getDeThi } from "../../api/lambai";
import MainLayoutSV from "../../components/MainLayoutSV";

export default function LamBaiListScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const isOpen = (item) => {
  const now = new Date();

  const start = item.ThoiGianBatDau ? new Date(item.ThoiGianBatDau) : null;
  const end = item.ThoiGianKetThuc ? new Date(item.ThoiGianKetThuc) : null;

  return (!start || now >= start) && (!end || now <= end);
};

  // ================= LOAD DATA =================
  useEffect(() => {
    if (user?.userId) {
      load();
    }
  }, [user]);

  const load = async () => {
    try {
      setLoading(true);

      const res = await getDeThi(user.userId);

      setData(Array.isArray(res) ? res : []);

    } catch (err) {
      console.log("LOAD DE THI ERROR:", err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // ================= FILTER (OPTIMIZED) =================
  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return data;

    return data.filter((x) =>
      x?.TenDe?.toLowerCase().includes(keyword)
    );
  }, [search, data]);

  // ================= UI =================
  return (
    <MainLayoutSV navigation={navigation} title="📚 Danh sách đề thi">

      <View style={styles.container}>

        {/* SEARCH */}
        <TextInput
          placeholder="🔍 Tìm kiếm đề thi..."
          value={search}
          onChangeText={setSearch}
          style={styles.search}
        />

        {/* LOADING */}
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={{ marginTop: 10 }}>Đang tải dữ liệu...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.center}>
            <Text>Không có đề thi nào</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(i) => i.MaDe.toString()}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              
              <TouchableOpacity
                onPress={() => {
                  if (!isOpen(item)) {
                    Alert.alert("Thông báo", "Đề thi chưa mở hoặc đã hết hạn");
                    return;
                  }

                  navigation.navigate("LamBaiScreen", { id: item.MaDe });
                }}
                style={styles.card}
              >

                <Text style={styles.title}>
                  📘 {item.TenDe}
                </Text>

                <Text style={styles.sub}>
                  👥 Lớp: {item.TenNhom || "Không có lớp"}
                </Text>

                {/* optional info */}
                <Text style={styles.meta}>
                  ⏱ Thời gian: {item.ThoiGianThi || 0} phút
                </Text>

                <Text style={styles.meta}>
                  🔁 Lượt làm: {item.SoLanLamToiDa || "Không giới hạn"}
                </Text>

                <View style={styles.btn}>
                  <Text style={styles.btnText}>Làm bài →</Text>
                </View>

              </TouchableOpacity>
            )}
          />
        )}

      </View>

    </MainLayoutSV>
  );
}

// ================= STYLE =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f4f6f9",
  },

  search: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 2,
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#2c3e50",
  },

  sub: {
    fontSize: 13,
    color: "#666",
    marginBottom: 5,
  },

  meta: {
    fontSize: 12,
    color: "#888",
    marginBottom: 3,
  },

  btn: {
    backgroundColor: "#3498db",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },

  center: {
    marginTop: 30,
    alignItems: "center",
    justifyContent: "center",
  },
});