import React, { useEffect, useState, useContext } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { AuthContext } from "../../../context/AuthContext";
import { getNhomGV } from "../../../api/quanlydiem";

export default function NhomTheoMonScreen({ route, navigation }) {
  const { maMonHoc, tenMon } = route.params;
  const { user } = useContext(AuthContext);

  const [nhom, setNhom] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await getNhomGV(user.userId, maMonHoc);
    setNhom(res.data);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📘 {tenMon}</Text>

      <FlatList
        data={nhom}
        keyExtractor={item => item.MaNhom.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate("BangDiem", {
                maNhom: item.MaNhom,
              })
            }
          >
            <Text style={styles.name}>{item.TenNhom}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f4f6fb" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  card: { backgroundColor: "#fff", padding: 15, borderRadius: 12, marginBottom: 10 },
  name: { fontWeight: "bold" }
});