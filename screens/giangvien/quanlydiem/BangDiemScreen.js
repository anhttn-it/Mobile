import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

import DaNopTab from "./tabs/DaNopTab";
import ChuaNopTab from "./tabs/ChuaNopTab";
import BieuDoTab from "./tabs/BieuDoTab";
import CauHoiTab from "./tabs/CauHoiTab";

export default function BangDiemScreen({ route }) {
  const { maNhom } = route.params;
  const [tab, setTab] = useState("danop");

  return (
    <View style={{ flex: 1 }}>

      {/* CONTENT */}
      {tab === "danop" && <DaNopTab maNhom={maNhom} />}
      {tab === "chuanop" && <ChuaNopTab maNhom={maNhom} />}
      {tab === "bieuDo" && <BieuDoTab />}
      {tab === "cauhoi" && <CauHoiTab />}

      {/* BOTTOM NAV */}
      <View style={styles.nav}>
        <Btn text="Đã nộp" onPress={() => setTab("danop")} />
        <Btn text="Chưa nộp" onPress={() => setTab("chuanop")} />
        <Btn text="Biểu đồ" onPress={() => setTab("bieuDo")} />
        <Btn text="% Câu" onPress={() => setTab("cauhoi")} />
      </View>
    </View>
  );
}

const Btn = ({ text, onPress }) => (
  <TouchableOpacity onPress={onPress}>
    <Text style={{ fontSize: 12 }}>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  nav: {
    height: 60,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    backgroundColor: "#fff"
  }
});