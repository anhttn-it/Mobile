import React, { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { getThongKeCauHoi } from "../../../../api/quanlydiem";

export default function CauHoiTab({ maDe = 1 }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await getThongKeCauHoi(maDe);
    setData(res.data);
  };

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => (
        <View>
          <Text>{item.NoiDung}</Text>
          <Text>Đúng: {item.SoDung}/{item.Tong}</Text>
        </View>
      )}
    />
  );
}