"use client"

import { useEffect, useState } from "react";
import { getUsersCountByMonth } from "@/lib/actions/user.actions"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

export function Overview() {
  const [data, setData] = useState([
    { name: "Jan", total: 0 },
    { name: "Feb", total: 0 },
    { name: "Mar", total: 0 },
    { name: "Apr", total: 0 },
    { name: "May", total: 0 },
    { name: "Jun", total: 0 },
    { name: "Jul", total: 0 },
    { name: "Aug", total: 0 },
    { name: "Sep", total: 0 },
    { name: "Oct", total: 0 },
    { name: "Nov", total: 0 },
    { name: "Dec", total: 0 },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      for (let i = 0; i < data.length; i++) {
        const month = i + 1; // Months are 1-based
        try {
          const userCount = await getUsersCountByMonth(month);
          setData(prevData => prevData.map((item, index) => (index === i ? { ...item, total: userCount } : item)));
        } catch (error) {
          // Handle errors, e.g., log them or set a default value
          console.error(`Error fetching user count for ${data[i].name}:`, error);
          setData(prevData => prevData.map((item, index) => (index === i ? { ...item, total: 0 } : item)));
        }
      }
    };

    fetchData();
  }, []); // The empty dependency array ensures that this effect runs only once, equivalent to componentDidMount

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: any) => `${value}`}
        />
        <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
