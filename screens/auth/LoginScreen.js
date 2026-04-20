import React, { useState, useContext } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginApi } from "../../api/auth";
import { AuthContext } from "../../context/AuthContext";

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext); // ✅ FIX QUAN TRỌNG

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);

      const res = await loginApi(email, pass);

      if (!res.success) {
        Alert.alert("Lỗi", res.message);
        return;
      }

      // ❌ KHÔNG dùng setUser nữa
      // ❌ KHÔNG set AsyncStorage trực tiếp ở đây

      await login(res); // ✅ FIX: gọi context

    } catch (err) {
      Alert.alert("Lỗi", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đăng nhập</Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Mật khẩu"
        secureTextEntry
        style={styles.input}
        onChangeText={setPass}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Login</Text>
        )}
      </TouchableOpacity>

      <View style={styles.row}>
        <Text onPress={() => navigation.navigate("Forgot")}>
          Quên mật khẩu?
        </Text>

        <Text onPress={() => navigation.navigate("Register")}>
          Đăng ký
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
    padding: 12,
    borderRadius: 10,
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
});