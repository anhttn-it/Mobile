import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { resetApi } from "../../api/auth";

export default function ResetPasswordScreen({ route, navigation }) {
  const { email } = route.params;

  const [pass1, setPass1] = useState("");
  const [pass2, setPass2] = useState("");

  const handle = async () => {
    if (pass1 !== pass2) {
      Alert.alert("Lỗi", "Mật khẩu không khớp");
      return;
    }

    try {
      const res = await resetApi({
        Email: email,
        NewPassword: pass1,
        ConfirmPassword: pass2,
      });

      if (res.success) {
        Alert.alert("Thành công", "Đổi mật khẩu thành công");
        navigation.replace("Login");
      } else {
        Alert.alert("Lỗi", res.message || "Không đổi được mật khẩu");
      }
    } catch (e) {
      Alert.alert("Lỗi", "Không kết nối server");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Đặt lại mật khẩu</Text>
        <Text style={styles.sub}>{email}</Text>

        <TextInput
          placeholder="Mật khẩu mới"
          secureTextEntry
          value={pass1}
          onChangeText={setPass1}
          style={styles.input}
        />

        <TextInput
          placeholder="Xác nhận mật khẩu"
          secureTextEntry
          value={pass2}
          onChangeText={setPass2}
          style={styles.input}
        />

        <TouchableOpacity style={styles.button} onPress={handle}>
          <Text style={styles.buttonText}>Xác nhận</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6fb",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  sub: {
    color: "#666",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#27ae60",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});