import React, { useContext } from "react";
import { createStackNavigator } from "@react-navigation/stack";

import { AuthContext } from "../context/AuthContext";

import AuthNavigator from "./AuthNavigator";
import AdminNavigator from "./AdminNavigator";
import GVNavigator from "./GVNavigator";
import SVNavigator from "./SVNavigator";

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : user.role === "Admin" ? (
        <Stack.Screen name="Admin" component={AdminNavigator} />
      ) : user.role === "GiangVien" ? (
        <Stack.Screen name="GV" component={GVNavigator} />
      ) : (
        <Stack.Screen name="SV" component={SVNavigator} />
      )}
    </Stack.Navigator>
  );
}