import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { getDaNop } from "../../../../api/quanlydiem";

export default function DaNopTab({ maDe = 1 }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await getDaNop(maDe);
    setData(res.data);
  };

  return (
    <FlatList
      data={data}
      keyExtractor={item => item.MaKetQua.toString()}
      renderItem={({ item }) => (
        <View style={{ padding: 15 }}>
          <Text>{item.HoTen}</Text>
          <Text>Điểm: {item.Diem}</Text>

          <TouchableOpacity>
            <Text style={{ color: "blue" }}>Xem chi tiết</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
}