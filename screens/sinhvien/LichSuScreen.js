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

import { AuthContext } from "../../context/AuthContext";
import { getLichSu } from "../../api/lichsu";

export default function LichSuScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await getLichSu(user.userId);
      setData(res || []);
    } catch (err) {
      console.log(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = data.filter((x) =>
    x.TenDe?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Quay lại</Text>
        </TouchableOpacity>

        <Text style={styles.title}>📊 Lịch sử làm bài</Text>
      </View>

      {/* SEARCH */}
      <TextInput
        placeholder="🔍 Tìm đề..."
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      {/* LIST */}
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.MaKetQua.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate("LichSuDetail", {
                maKetQua: item.MaKetQua,
              })
            }
          >
            <Text style={styles.titleCard}>📘 {item.TenDe}</Text>

            <Text>Điểm: {item.DiemThi}</Text>
            <Text>
              Đúng: {item.SoCauDung}/{item.TongCau}
            </Text>

            <Text style={styles.time}>
              {new Date(item.ThoiGianVaoThi).toLocaleString()}
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
    backgroundColor: "#f4f6f9",
    padding: 12,
  },

  header: {
    marginBottom: 10,
  },

  back: {
    color: "#2196F3",
    fontWeight: "bold",
    marginBottom: 5,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
  },

  search: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },

  titleCard: {
    fontSize: 16,
    fontWeight: "bold",
  },

  time: {
    marginTop: 5,
    fontSize: 12,
    color: "#888",
  },
};