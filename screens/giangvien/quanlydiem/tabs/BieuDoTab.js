import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { getThongKeDiem } from "../../../../api/quanlydiem";

export default function BieuDoTab({ maDe = 1 }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await getThongKeDiem(maDe);
    setData(res.data);
  };

  return (
    <View>
      {data.map((d, i) => (
        <Text key={i}>{d.label}: {d.value}</Text>
      ))}
    </View>
  );
}