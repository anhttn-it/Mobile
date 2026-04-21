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

import { getNhomByMon } from "../../../api/quanlydiem";
import { AuthContext } from "../../../context/AuthContext";

export default function NhomTheoMonScreen({ route, navigation }) {
  const { maMonHoc } = route.params;
  const { user } = useContext(AuthContext);

  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getNhomByMon(maMonHoc, user.userId);
        setData(res || []);
      } catch (err) {
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [maMonHoc]);

  // ================= SEARCH =================
  const filteredData = data.filter(item =>
    item.TenNhom?.toLowerCase().includes(search.toLowerCase())
  );

  // ================= LOADING =================
  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Đang tải lớp...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Quay lại</Text>
        </TouchableOpacity>

        <Text style={styles.title}>📚 Danh sách lớp</Text>
      </View>

      {/* SEARCH */}
      <TextInput
        placeholder="🔍 Tìm lớp học..."
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      {/* LIST */}
      <FlatList
        data={filteredData}
        keyExtractor={(i) => i.MaNhom.toString()}
        ListEmptyComponent={
          <Text style={styles.empty}>
            ❌ Không tìm thấy lớp
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("BangDiem", {
                maNhom: item.MaNhom,
                tenNhom: item.TenNhom,
              })
            }
            style={styles.card}
          >
            <Text style={styles.cardTitle}>
              🏫 {item.TenNhom}
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#f2f4f8",
    paddingHorizontal: 15,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    marginTop: 10,
    marginBottom: 10,
  },

  back: {
    color: "#2196F3",
    fontWeight: "bold",
    marginBottom: 10,
  },

  title: {
    fontSize: 20,
    fontWeight: "bold",
  },

  search: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },

  empty: {
    textAlign: "center",
    marginTop: 20,
    color: "#888",
  },
};