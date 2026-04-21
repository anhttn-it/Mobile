import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import HomeGV from "../screens/giangvien/HomeGV";
// sau này thêm:
// import ClassScreen from "../screens/giangvien/ClassScreen";
// import ExamScreen from "../screens/giangvien/ExamScreen";
import NhomScreen from "../screens/giangvien/NhomScreen";
import MonHocDiemScreen from "../screens/giangvien/quanlydiem/MonHocDiemScreen";
import NhomTheoMonScreen from "../screens/giangvien/quanlydiem/NhomTheoMonScreen";
import BangDiemScreen from "../screens/giangvien/quanlydiem/BangDiemScreen";

const Stack = createStackNavigator();

export default function GVNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeGV" component={HomeGV} />

      {/* THÊM MÀN HÌNH SAU NÀY */}
      {/* <Stack.Screen name="Class" component={ClassScreen} /> */}
      {/* <Stack.Screen name="Exam" component={ExamScreen} /> */}
      <Stack.Screen name="Nhom" component={NhomScreen} />
      <Stack.Screen name="Diem" component={MonHocDiemScreen} />
      <Stack.Screen name="NhomTheoMon" component={NhomTheoMonScreen} />
      <Stack.Screen name="BangDiem" component={BangDiemScreen} />
    </Stack.Navigator>
  );
}