import React, { useContext } from "react";
import { Text } from "react-native";

import MainLayout from "../../components/MainLayout";
import { AuthContext } from "../../context/AuthContext";

export default function HomeGV({ navigation }) {
  const { user } = useContext(AuthContext);

  return (
    <MainLayout title="Trang chủ Giảng viên" navigation={navigation}>
      <Text style={{ fontSize: 26, fontWeight: "bold" }}>
        Xin chào 👋
      </Text>

      <Text>{user?.hoTen}</Text>
    </MainLayout>
  );
}