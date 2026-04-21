import React, { useEffect, useState } from "react";
import { FlatList, Text } from "react-native";
import { getChuaNop } from "../../../../api/quanlydiem";

export default function ChuaNopTab({ maDe = 1, maNhom }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await getChuaNop(maDe, maNhom);
    setData(res.data);
  };

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => <Text>{item.HoTen}</Text>}
    />
  );
}