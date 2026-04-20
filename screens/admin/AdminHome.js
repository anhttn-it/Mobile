import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function AdminHome({ user, logout }) {
  const [open, setOpen] = useState(false);
  const [anim] = useState(new Animated.Value(-width * 0.7));

  const toggleMenu = () => {
    const toValue = open ? -width * 0.7 : 0;

    Animated.timing(anim, {
      toValue,
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

        <Text style={styles.headerTitle}>Admin Dashboard</Text>

        <View style={{ width: 30 }} />
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        <Text style={styles.welcome}>Xin chào Admin 🔥</Text>

        <Text style={styles.name}>{user?.hoTen}</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Hệ thống</Text>
          <Text style={styles.text}>Quản lý người dùng, lớp học, quyền</Text>
        </View>
      </View>

      {/* OVERLAY */}
      {open && (
        <TouchableOpacity style={styles.overlay} onPress={toggleMenu} />
      )}

      {/* DRAWER */}
      <Animated.View style={[styles.drawer, { left: anim }]}>
        <Text style={styles.drawerTitle}>Menu Admin</Text>

        {/* 👉 Sau này thêm chức năng admin vào đây */}
        {/* 
        <TouchableOpacity style={styles.item}>
          <Text>👤 Quản lý user</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item}>
          <Text>📚 Quản lý lớp</Text>
        </TouchableOpacity>
        */}

        <Text style={styles.placeholder}>Chưa có chức năng</Text>

        {/* LOGOUT */}
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
  container: {
    flex: 1,
    backgroundColor: "#f4f6fb",
  },

  header: {
    height: 60,
    backgroundColor: "#e74c3c",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
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
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    elevation: 3,
  },

  cardTitle: {
    fontWeight: "bold",
    marginBottom: 5,
  },

  text: {
    color: "#555",
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

  placeholder: {
    color: "#888",
    marginBottom: 10,
  },

  item: {
    paddingVertical: 10,
  },

  logout: {
    marginTop: 30,
    backgroundColor: "red",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
});