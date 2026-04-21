import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import HomeSV from "../screens/sinhvien/HomeSV";
import MyGroupsScreen from "../screens/sinhvien/MyGroupsScreen.js";
import JoinGroupScreen from "../screens/sinhvien/JoinGroupScreen.js";

const Stack = createStackNavigator();

export default function SVNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeSV" component={HomeSV} />
      <Stack.Screen name="MyGroups" component={require("../screens/sinhvien/MyGroupsScreen.js").default} />
      <Stack.Screen name="JoinGroupScreen" component={require("../screens/sinhvien/JoinGroupScreen.js").default} />
      {/* sau này thêm:
      <Stack.Screen name="ExamList" component={ExamList} />
      <Stack.Screen name="Result" component={ResultScreen} />
      */}
    </Stack.Navigator>
  );
}