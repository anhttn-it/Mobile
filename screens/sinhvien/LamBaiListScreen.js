import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import { getDeThi } from "../../api/lambai";

export default function LamBaiListScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await getDeThi(user.userId);
    setData(res || []);
  };

  const filtered = data.filter(x =>
    x.TenDe?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📚 Danh sách đề thi</Text>
      </View>

      {/* SEARCH */}
      <TextInput
        placeholder="🔍 Tìm kiếm đề thi..."
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      {/* LIST */}
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.MaDe.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("LamBaiScreen", { id: item.MaDe })
            }
            style={styles.card}
          >
            <Text style={styles.title}>📘 {item.TenDe}</Text>

            <Text style={styles.sub}>
              📝 Dễ: {item.SoCauDe} | TB: {item.SoCauTrungBinh} | Khó:{" "}
              {item.SoCauKho}
            </Text>

            <View style={styles.btn}>
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                Làm bài →
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f9",
    paddingHorizontal: 15,
  },

  // HEADER
  header: {
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },

  // SEARCH
  search: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 10,
  },

  // CARD
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#2c3e50",
  },

  sub: {
    fontSize: 13,
    color: "#666",
    marginBottom: 10,
  },

  // BUTTON
  btn: {
    backgroundColor: "#3498db",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
});