import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { registerApi } from "../../api/auth";

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [role, setRole] = useState("SinhVien");

  const handle = async () => {
    try {
      await registerApi({
        Email: email,
        HoTen: name,
        MatKhau: pass,
        Role: role,
      });

      Alert.alert("Thành công", "Đăng ký thành công");
      navigation.navigate("Login");
    } catch (e) {
      Alert.alert("Lỗi", e.message);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f7fb" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >

        {/* TITLE */}
        <Text style={styles.title}>Đăng ký tài khoản</Text>
        <Text style={styles.subtitle}>Tạo tài khoản để bắt đầu</Text>

        {/* CARD */}
        <View style={styles.card}>

          <TextInput
            placeholder="Email"
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
          />

          <TextInput
            placeholder="Họ tên"
            onChangeText={setName}
            style={styles.input}
          />

          <TextInput
            placeholder="Mật khẩu"
            onChangeText={setPass}
            secureTextEntry
            style={styles.input}
          />

          {/* ROLE */}
          <Text style={styles.label}>Chọn quyền:</Text>

          <View style={styles.roleBox}>
            <TouchableOpacity
              style={[
                styles.roleBtn,
                role === "SinhVien" && styles.roleActive,
              ]}
              onPress={() => setRole("SinhVien")}
            >
              <Text style={styles.roleText}>Sinh viên</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleBtn,
                role === "GiangVien" && styles.roleActive,
              ]}
              onPress={() => setRole("GiangVien")}
            >
              <Text style={styles.roleText}>Giảng viên</Text>
            </TouchableOpacity>
          </View>

          {/* BUTTON */}
          <TouchableOpacity style={styles.button} onPress={handle}>
            <Text style={styles.buttonText}>Đăng ký</Text>
          </TouchableOpacity>

          {/* BACK LOGIN */}
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.link}>Đã có tài khoản? Đăng nhập</Text>
          </TouchableOpacity>

        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ================= STYLE =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
  },

  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: "#fafafa",
  },

  label: {
    marginBottom: 8,
    fontWeight: "600",
  },

  roleBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  roleBtn: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginHorizontal: 5,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },

  roleActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },

  roleText: {
    color: "#000",
  },

  button: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  link: {
    textAlign: "center",
    marginTop: 12,
    color: "#2563eb",
  },
});