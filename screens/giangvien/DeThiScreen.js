import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";

import MainLayout from "../../components/MainLayout";
import { AuthContext } from "../../context/AuthContext";
import { getDeThiList, deleteDeThi } from "../../api/dethi";


export default function DeThiScreen({ navigation }) {
 const { user } = useContext(AuthContext);
const [search, setSearch] = useState("");
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);

// ================= LOAD DATA =================
const loadData = async () => {
  try {
    if (!user?.userId) return;

    setLoading(true);

    const res = await getDeThiList(user.userId);
    setData(res);

  } catch (err) {
    Alert.alert("Lỗi", err.message);
  } finally {
    setLoading(false);
  }
};

// ================= LOAD LẦN ĐẦU =================
useEffect(() => {
  if (user?.userId) {
    loadData();
  }
}, [user?.userId]);

// ================= RELOAD KHI QUAY LẠI MÀN =================
useEffect(() => {
  const unsubscribe = navigation.addListener("focus", () => {
    loadData();
  });

  return unsubscribe;
}, [navigation]);

const filteredData = data.filter(item =>
  item.TenDe?.toLowerCase().includes(search.toLowerCase())
);

 const handleDelete = (id) => {
  Alert.alert("Xác nhận", "Xóa đề này?", [
    { text: "Hủy" },
    {
      text: "Xóa",
      onPress: async () => {
        try {
          await deleteDeThi(id, user.userId); // 🔥 FIX Ở ĐÂY
          loadData();
        } catch (err) {
          Alert.alert("Lỗi", err.message);
        }
      },
    },
  ]);
};

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.TenDe}</Text>
      <Text>Số câu: {item.SoCauDe + item.SoCauTrungBinh + item.SoCauKho}</Text>

    <Text style={{ marginTop: 4, color: "#555" }}>
    Nhóm: {item.TenNhom ? item.TenNhom : "Không thuộc nhóm"}
    </Text>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.btn}
          onPress={() =>
            navigation.navigate("DeThiDetailScreen", { id: item.MaDe })
          }
        >
          <Text style={{ color: "#fff" }}>Chi tiết</Text>
        </TouchableOpacity>

        <TouchableOpacity
        style={styles.btn}
        onPress={() =>
            navigation.navigate("EditDeThiScreen", { id: item.MaDe })
        }
        >
        <Text style={{ color: "#fff" }}>Sửa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.delete}
          onPress={() => handleDelete(item.MaDe)}
        >
          <Text style={{ color: "#fff" }}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return <ActivityIndicator size="large" />;

 return (
  <MainLayout title="📘 Đề thi" navigation={navigation}>

    {/* TOP BAR: TẠO + SEARCH */}
    <View style={styles.topBar}>

    <TextInput
        placeholder="🔍 Tìm kiếm đề thi..."
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => navigation.navigate("CreateDeThiScreen")}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>
          + Tạo đề
        </Text>
      </TouchableOpacity>

    </View>

    {/* LIST */}
    <FlatList
      data={filteredData}
      keyExtractor={(item) => item.MaDe.toString()}
      renderItem={renderItem}
    />

  </MainLayout>
);
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 15,
    margin: 10,
    borderRadius: 10,
  },
  title: { fontWeight: "bold", fontSize: 16 },
  row: { flexDirection: "row", marginTop: 10 },
  btn: {
    backgroundColor: "#2196F3",
    padding: 8,
    marginRight: 5,
    borderRadius: 6,
  },
  delete: {
    backgroundColor: "red",
    padding: 8,
    borderRadius: 6,
  },

  addBtn: {
  backgroundColor: "#2ecc71",
  padding: 12,
  borderRadius: 10,
  alignItems: "center",
  margin: 10,
},

topBar: {
  flexDirection: "row",
  alignItems: "center",
  margin: 10,
  gap: 10,
},

search: {
  flex: 1,
  backgroundColor: "#fff",
  padding: 10,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: "#ddd",
},

});