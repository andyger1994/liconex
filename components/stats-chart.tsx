"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Point = { name: string; ingresos: number; gastos: number; ganancia: number };
type CategoryPoint = { name: string; total: number };

export function MoneyTrendChart({ data }: { data: Point[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ left: -20, right: 8, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="income" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#72f2c7" stopOpacity={0.55} />
              <stop offset="95%" stopColor="#72f2c7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.58)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "rgba(255,255,255,0.58)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: "#10251f", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 14, color: "white" }} />
          <Area type="monotone" dataKey="ingresos" stroke="#72f2c7" fill="url(#income)" />
          <Area type="monotone" dataKey="gastos" stroke="#f2a65a" fill="transparent" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryBarChart({ data }: { data: CategoryPoint[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ left: -20, right: 8, top: 10, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.58)", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "rgba(255,255,255,0.58)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: "#10251f", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 14, color: "white" }} />
          <Bar dataKey="total" fill="#f2a65a" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
