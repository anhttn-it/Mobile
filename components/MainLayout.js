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
import { AuthContext } from "../context/AuthContext";

const { width } = Dimensions.get("window");

export default function MainLayout({ children, title, navigation }) {
  const { logout } = useContext(AuthContext);

  const [open, setOpen] = useState(false);
  const [anim] = useState(new Animated.Value(-width * 0.7));

  const toggleMenu = () => {
    Animated.timing(anim, {
      toValue: open ? -width * 0.7 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();

    setOpen(!open);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleMenu}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{title}</Text>

        <View style={{ width: 30 }} />
      </View>

      {/* CONTENT */}
      <View style={styles.content}>{children}</View>

      {/* OVERLAY */}
      {open && (
        <TouchableOpacity style={styles.overlay} onPress={toggleMenu} />
      )}

      {/* SIDEBAR */}
      <Animated.View style={[styles.drawer, { left: anim }]}>
        <Text style={styles.drawerTitle}>Menu</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            toggleMenu();
            navigation.navigate("HomeGV");
          }}
        >
          <Text>🏠 Trang chủ</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            toggleMenu();
            navigation.navigate("CauHoi");
          }}
        >
          <Text>❓ Quản lý câu hỏi</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            toggleMenu();
            navigation.navigate("Nhom");
          }}
        >
          <Text>📚 Quản lý lớp học</Text>
        </TouchableOpacity>


        <TouchableOpacity style={styles.logout} onPress={logout}>
          <Text style={{ color: "white", fontWeight: "bold" }}>
            🚪 Đăng xuất
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6fb" },

  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    backgroundColor: "#2f80ed",
  },

  menuIcon: { fontSize: 26, color: "#fff" },

  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  content: {
    flex: 1,
    padding: 15,
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