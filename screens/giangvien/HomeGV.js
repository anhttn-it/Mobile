import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";

const { width } = Dimensions.get("window");

export default function HomeGV({ navigation }) {
  // FIX: lấy từ Context thay vì props
  const { user, logout } = useContext(AuthContext);

  const [open, setOpen] = useState(false);
  const [anim] = useState(new Animated.Value(-width * 0.7));

  const toggleMenu = () => {
    if (open) {
      Animated.timing(anim, {
        toValue: -width * 0.7,
        duration: 250,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(anim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
    }
    setOpen(!open);
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleMenu}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Trang chủ Giảng viên</Text>

        <View style={{ width: 30 }} />
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        <Text style={styles.welcome}>Xin chào giảng viên 👋</Text>

        {/* FIX: tránh undefined khi Context chưa load */}
        <Text style={styles.name}>
          {user?.hoTen}
        </Text>

        {/* <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Tổng quan</Text>
          <Text>• Lớp đang dạy: 3</Text>
          <Text>• Sinh viên: 120</Text>
          <Text>• Bài kiểm tra: 5</Text>
        </View> */}
      </View>

      {/* OVERLAY */}
      {open && (
        <TouchableOpacity style={styles.overlay} onPress={toggleMenu} />
      )}

      {/* SIDEBAR MENU */}
      <Animated.View style={[styles.drawer, { left: anim }]}>

        <Text style={styles.drawerTitle}>Menu</Text>

        {/* Thêm chức năng ở menu cho giảng viên ở đây */}

        {/* <TouchableOpacity style={styles.menuItem}>
          <Text>📚 Lớp học</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text>📝 Bài kiểm tra</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text>👨‍🎓 Sinh viên</Text>
        </TouchableOpacity> */}
        <TouchableOpacity
  style={styles.menuItem}
  onPress={() => {
    toggleMenu();
    navigation.navigate("Nhom");
  }}
>
  <Text>📚 Lớp học</Text>
</TouchableOpacity>

        <TouchableOpacity style={styles.logout} onPress={logout}>
          <Text style={{ color: "white", fontWeight: "bold"}}>
            🚪 Đăng xuất
          </Text>
        </TouchableOpacity>

      </Animated.View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6fb",
  },

  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    backgroundColor: "#2f80ed",
  },

  menuIcon: {
    fontSize: 26,
    color: "#fff",
  },

  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  content: {
    padding: 20,
  },

  welcome: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 20,
  },

  name: {
    fontSize: 18,
    color: "#555",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    elevation: 4,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },

  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.3)",
  },

  drawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: width * 0.7,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 15,
    elevation: 10,
  },

  drawerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },

  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    borderColor: "#ddd",
  },

  logout: {
    marginTop: 30,
    backgroundColor: "red",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
});