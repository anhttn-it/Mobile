import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import { AuthContext } from "../../context/AuthContext";
import { getDeThi } from "../../api/lambai";
import MainLayoutSV from "../../components/MainLayoutSV";

export default function LamBaiListScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getDeThi(user?.userId);
      setData(Array.isArray(res) ? res : []);
    } catch (err) {
      console.log("LOAD DE THI ERROR:", err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = data.filter((x) =>
    x?.TenDe?.toLowerCase().includes(search.toLowerCase())
  );

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
            <Text>Đang tải dữ liệu...</Text>
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
                onPress={() =>
                  navigation.navigate("LamBaiScreen", { id: item.MaDe })
                }
                style={styles.card}
              >
                <Text style={styles.title}>📘 {item.TenDe}</Text>

                <Text style={styles.sub}>
                  📝 Dễ: {item.SoCauDe ?? 0} | TB:{" "}
                  {item.SoCauTrungBinh ?? 0} | Khó:{" "}
                  {item.SoCauKho ?? 0}
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


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f4f6f9",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2c3e50",
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
    marginBottom: 10,
  },

  btn: {
    backgroundColor: "#3498db",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
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