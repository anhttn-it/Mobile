import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import HomeSV from "../screens/sinhvien/HomeSV";
import MyGroupsScreen from "../screens/sinhvien/MyGroupsScreen.js";
import JoinGroupScreen from "../screens/sinhvien/JoinGroupScreen.js";
import LamBaiScreen from "../screens/sinhvien/LamBaiScreen.js";
import LamBaiListScreen from "../screens/sinhvien/LamBaiListScreen.js";
import LichSuScreen from "../screens/sinhvien/LichSuScreen.js";
import LichSuDetailScreen from "../screens/sinhvien/LichSuDetailScreen.js";

const Stack = createStackNavigator();

export default function SVNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeSV" component={HomeSV} />
      <Stack.Screen name="MyGroups" component={require("../screens/sinhvien/MyGroupsScreen.js").default} />
      <Stack.Screen name="JoinGroupScreen" component={require("../screens/sinhvien/JoinGroupScreen.js").default} />
      <Stack.Screen name="LamBaiScreen" component={require("../screens/sinhvien/LamBaiScreen.js").default} />
      <Stack.Screen name="LamBaiListScreen" component={require("../screens/sinhvien/LamBaiListScreen.js").default} />
      <Stack.Screen name="lichsu" component={require("../screens/sinhvien/LichSuScreen.js").default} />
      <Stack.Screen name="LichSuDetail" component={require("../screens/sinhvien/LichSuDetailScreen.js").default} />
      {/* sau này thêm:
      <Stack.Screen name="ExamList" component={ExamList} />
      <Stack.Screen name="Result" component={ResultScreen} />
      */}
    </Stack.Navigator>
  );
}