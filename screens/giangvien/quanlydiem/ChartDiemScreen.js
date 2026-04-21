import React, { useEffect, useState } from "react";
import { View, Text, Dimensions } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { getThongKe } from "../../../api/quanlydiem";

const w = Dimensions.get("window").width;

export default function ChartDiemScreen({ route }) {
  const { maDe } = route.params;
  const [data, setData] = useState(null);

  useEffect(() => {
    getThongKe(maDe).then(setData);
  }, []);

  if (!data) return <Text>Loading...</Text>;

  return (
    <View>
      <Text>Biểu đồ điểm</Text>

      <BarChart
        data={{
          labels: ["<5", "5-7", "7-8", "8+"],
          datasets: [
            {
              data: [
                data.duoi5,
                data.tu5den7,
                data.tu7den8,
                data.tren8
              ]
            }
          ]
        }}
        width={w}
        height={220}
        chartConfig={{
          color: () => "#2e86de"
        }}
      />
    </View>
  );
}