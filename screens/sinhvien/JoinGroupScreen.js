import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import { joinGroup } from "../../api/group";

export default function JoinGroupScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  const [maMoi, setMaMoi] = useState("");
  const [loading, setLoading] = useState(false);

const handleJoin = async () => {
  try {
    if (!user?.userId) {
      Alert.alert("Lỗi", "Không tìm thấy userId, hãy đăng nhập lại");
      return;
    }

    if (!maMoi.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mã nhóm");
      return;
    }

    setLoading(true);

    await joinGroup(user.userId, maMoi.trim());

    Alert.alert("Thành công", "Tham gia nhóm thành công");
    navigation.goBack();

  } catch (err) {
    Alert.alert("Lỗi", err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Tham gia nhóm</Text>

        <View style={{ width: 30 }} />
      </View>

      {/* INPUT */}
      <View style={styles.box}>
        <Text style={styles.label}>Nhập mã nhóm</Text>

        <TextInput
          value={maMoi}
          onChangeText={setMaMoi}
          placeholder="VD: ABC123"
          style={styles.input}
          autoCapitalize="characters"
        />

        <TouchableOpacity
          style={styles.btn}
          onPress={handleJoin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>THAM GIA</Text>
          )}
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f9",
    padding: 15,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  back: {
    fontSize: 26,
    color: "#2196F3",
    paddingHorizontal: 10,
  },

  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },

  box: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    elevation: 2,
  },

  label: {
    fontWeight: "bold",
    marginBottom: 8,
  },

  input: {
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },

  btn: {
    backgroundColor: "#2ecc71",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});