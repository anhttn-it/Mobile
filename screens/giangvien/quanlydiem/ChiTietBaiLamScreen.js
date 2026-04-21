import React, { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { getChiTiet } from "../../../api/quanlydiem";

export default function ChiTietBaiLamScreen({ route }) {
  const { maKetQua } = route.params;
  const [data, setData] = useState([]);

  useEffect(() => {
    getChiTiet(maKetQua).then(setData);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={data}
        keyExtractor={(i, idx) => idx.toString()}
        renderItem={({ item }) => (
          <View style={{ padding: 10, margin: 5 }}>
            <Text>{item.NoiDung}</Text>
            <Text style={{ color: "blue" }}>
              Đáp án chọn: {item.DapAnChon}
            </Text>
          </View>
        )}
      />
    </View>
  );
}