import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import AdminHome from "../screens/admin/AdminHome";

const Stack = createStackNavigator();

export default function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminHome" component={AdminHome} />
    </Stack.Navigator>
  );
}