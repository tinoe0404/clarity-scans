"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { Locale } from "@/types";

interface LanguageStat {
  language: Locale | string;
  count: number;
}

interface LanguageChartProps {
  data: LanguageStat[];
}

const COLORS = {
  en: "#38bdf8", // brand blue
  sn: "#10b981", // medical green
  nd: "#f59e0b", // amber
};


export default function LanguageChart({ data }: LanguageChartProps) {
  // Always include all 3 locales in the display array so the legend never drops one
  const chartData = useMemo(() => {
    const defaultData = [
      { language: "en", name: "English", count: 0, color: COLORS.en },
      { language: "sn", name: "Shona", count: 0, color: COLORS.sn },
      { language: "nd", name: "Ndebele", count: 0, color: COLORS.nd },
    ];

    data.forEach((stat) => {
      const match = defaultData.find((d) => d.language === stat.language);
      if (match) {
        match.count = stat.count;
      }
    });

    return defaultData;
  }, [data]);

  const totalSessions = chartData.reduce((sum, item) => sum + item.count, 0);
  const isEmpty = totalSessions === 0;

  // Custom label that hides if percentage is < 10%
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: { cx: number, cy: number, midAngle: number, innerRadius: number, outerRadius: number, percent: number }) => {
    if (percent < 0.1) return null;
    
    // Position outside a bit
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomLegend = ({ payload }: { payload: Array<{ value: string, color: string }> }) => {
    return (
      <ul className="flex justify-center gap-6 mt-4">
        {payload.map((entry, index: number) => {
          const entryData = chartData.find(d => d.name === entry.value);
          const percent = totalSessions > 0 ? Math.round(((entryData?.count || 0) / totalSessions) * 100) : 0;
          
          return (
            <li key={`item-${index}`} className="flex items-center gap-2">
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-slate-300">{entry.value}</span>
              <span className="text-xs text-slate-500 font-medium">
                ({percent}%, {entryData?.count})
              </span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-elevated overflow-hidden h-full flex flex-col">
      <div className="border-b border-surface-border p-5">
        <h3 className="text-base font-semibold text-white">Language Distribution</h3>
      </div>
      
      <div className="p-5 flex-1 w-full min-h-[300px] relative">
        {isEmpty ? (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 z-10">
            No sessions recorded in this period
          </div>
        ) : null}

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              labelLine={false}
              label={isEmpty ? false : renderCustomizedLabel}
              outerRadius={90}
              innerRadius={45} // Donut style
              paddingAngle={2}
              dataKey="count"
              stroke="none"
              opacity={isEmpty ? 0.2 : 1}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            {!isEmpty && (
              <Tooltip
                formatter={(value: number) => [`${value} Sessions`, "Count"]}
                contentStyle={{
                  backgroundColor: "#1e293b",
                  borderColor: "rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#f8fafc",
                }}
                itemStyle={{ color: "#f8fafc" }}
              />
            )}
            <Legend content={<CustomLegend />} verticalAlign="bottom" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
