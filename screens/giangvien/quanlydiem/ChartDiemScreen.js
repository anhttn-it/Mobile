import React from "react";

import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";

import {
  createMaterialTopTabNavigator,
} from "@react-navigation/material-top-tabs";

import MainLayout
from "../../../components/MainLayout";

import DaNopTab
from "./tabs/DaNopTab";

import ChuaNopTab
from "./tabs/ChuaNopTab";

import BieuDoTab
from "./tabs/BieuDoTab";

import CauHoiTab
from "./tabs/CauHoiTab";

const Tab =
  createMaterialTopTabNavigator();

export default function ChartDiemScreen({
  route,
  navigation,
}) {
  const {
    maDe,
    maNhom,
    tenDe,
  } = route.params;

  return (
    <MainLayout
      title={
        tenDe ||
        "Quản lý điểm"
      }
      navigation={
        navigation
      }
    >
      {/* ===== BACK BUTTON ROW ===== */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
      </View>

      <Tab.Navigator
        screenOptions={{
          tabBarLabelStyle:
            {
              fontSize: 13,
              fontWeight:
                "700",
              textTransform:
                "none",
            },

          tabBarIndicatorStyle:
            {
              backgroundColor:
                "#2563eb",
              height: 3,
            },

          tabBarStyle: {
            backgroundColor:
              "#fff",
          },

          tabBarActiveTintColor:
            "#2563eb",

          tabBarInactiveTintColor:
            "#6b7280",

          lazy: true,
        }}
      >
        <Tab.Screen
          name="Đã nộp"
        >
          {() => (
            <DaNopTab
              maDe={maDe}
            />
          )}
        </Tab.Screen>

        <Tab.Screen
          name="Chưa nộp"
        >
          {() => (
            <ChuaNopTab
              maDe={maDe}
              maNhom={
                maNhom
              }
            />
          )}
        </Tab.Screen>

        <Tab.Screen
          name="Biểu đồ"
        >
          {() => (
            <BieuDoTab
              maDe={maDe}
            />
          )}
        </Tab.Screen>

        <Tab.Screen
          name="% câu hỏi"
        >
          {() => (
            <CauHoiTab
              maDe={maDe}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  // ===== HEADER ROW =====
  headerRow: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: "#f3f4f6",
  },

  // ===== BACK BUTTON =====
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
  },

  backIcon: {
    fontSize: 28,
    color: "#2563eb",
    fontWeight: "bold",
    marginTop: -3,
  },
});