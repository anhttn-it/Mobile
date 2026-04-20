import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import HomeSV from "../screens/sinhvien/HomeSV";

const Stack = createStackNavigator();

export default function SVNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeSV" component={HomeSV} />

      {/* sau này thêm:
      <Stack.Screen name="ExamList" component={ExamList} />
      <Stack.Screen name="Result" component={ResultScreen} />
      */}
    </Stack.Navigator>
  );
}