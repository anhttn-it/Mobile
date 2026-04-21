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

import { AuthContext } from "../../context/AuthContext";
import { getMyGroups, leaveGroup } from "../../api/group";

import MainLayoutSV from "../../components/MainLayoutSV";

export default function MyGroupsScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const loadGroups = async () => {
    try {
      if (!user?.userId) return;

      setLoading(true);
      const res = await getMyGroups(user.userId);
      setGroups(res || []);
    } catch (err) {
      Alert.alert("Lỗi", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  const unsubscribe = navigation.addListener("focus", () => {
    if (user?.userId) {
      loadGroups();
    }
  });

  return unsubscribe;
}, [navigation, user?.userId]);

  useEffect(() => {
    if (user?.userId) loadGroups();
  }, [user?.userId]);

  const handleLeave = (maNhom) => {
    Alert.alert("Xác nhận", "Bạn muốn rời nhóm này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Rời",
        style: "destructive",
        onPress: async () => {
          try {
            await leaveGroup(user.userId, maNhom);
            loadGroups();
          } catch (err) {
            Alert.alert("Lỗi", err.message);
          }
        },
      },
    ]);
  };

  const filteredData = groups.filter((g) =>
    g.TenNhom?.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>📘 {item.TenNhom}</Text>

      <Text style={styles.info}>
        📚 Môn học: <Text style={styles.bold}>{item.TenMonHoc}</Text>
      </Text>

      <Text style={styles.info}>
        👥 Sĩ số: <Text style={styles.bold}>{item.SiSo}</Text>
      </Text>

      <TouchableOpacity
        style={styles.leaveBtn}
        onPress={() => handleLeave(item.MaNhom)}
      >
        <Text style={styles.leaveText}>Rời nhóm</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <MainLayoutSV navigation={navigation} title="Nhóm của tôi">
        <ActivityIndicator size="large" color="#2196F3" />
      </MainLayoutSV>
    );
  }

  return (
    <MainLayoutSV navigation={navigation} title="📚 Nhóm của tôi">

      {/* TOP BAR */}
      <View style={styles.topBar}>
        <TextInput
          placeholder="🔍 Tìm kiếm nhóm..."
          value={search}
          onChangeText={setSearch}
          style={styles.search}
        />

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate("JoinGroupScreen")}
        >
          <Text style={styles.addText}>＋</Text>
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.MaNhom.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <Text style={styles.empty}>Không có nhóm nào</Text>
        }
      />

    </MainLayoutSV>
  );
}
// ================= STYLE =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f9",
    padding: 12,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // TOP BAR
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
    borderColor: "#e0e0e0",
  },

  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#2ecc71",
    justifyContent: "center",
    alignItems: "center",
  },

  addText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },

  // CARD
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 2,
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },

  info: {
    fontSize: 13,
    color: "#555",
    marginTop: 2,
  },

  bold: {
    fontWeight: "bold",
    color: "#000",
  },

  leaveBtn: {
    marginTop: 12,
    backgroundColor: "#e74c3c",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  leaveText: {
    color: "#fff",
    fontWeight: "bold",
  },

  empty: {
    textAlign: "center",
    marginTop: 30,
    color: "#888",
  },
});