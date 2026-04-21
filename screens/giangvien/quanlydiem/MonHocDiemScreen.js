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

import { getMonHoc } from "../../../api/monhoc";
import { AuthContext } from "../../../context/AuthContext";

export default function MonHocDiemScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await getMonHoc(user.userId, "");
      setData(res?.data || []);
    } catch (err) {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredData = data.filter(item =>
    item.TenMonHoc?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Đang tải môn học...</Text>
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

        <Text style={styles.title}>📚 Môn học (Điểm)</Text>
      </View>

      {/* SEARCH */}
      <TextInput
        placeholder="🔍 Tìm môn học..."
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      {/* LIST */}
      <FlatList
        data={filteredData}
        keyExtractor={(i) => i.MaMonHoc.toString()}
        ListEmptyComponent={
          <Text style={styles.empty}>❌ Không tìm thấy môn học</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("NhomTheoMon", {
                maMonHoc: item.MaMonHoc,
              })
            }
            style={styles.card}
          >
            <Text style={styles.cardTitle}>📘 {item.TenMonHoc}</Text>
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