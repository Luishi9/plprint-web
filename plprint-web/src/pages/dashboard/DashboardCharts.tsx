import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import { ChartTooltip } from './DashboardComponents';

interface DashboardChartsProps {
  chartTab: string;
  data: Array<{ hora: string; ventas: number; monto: number }> | undefined;
}

export default function DashboardCharts({ chartTab, data }: DashboardChartsProps) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      {chartTab === 'area' ? (
        <AreaChart data={data ?? []} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradVentas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2e9e9b" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#2e9e9b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 18%)" />
          <XAxis dataKey="hora" tick={{ fill: 'hsl(215 16% 55%)', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'hsl(215 16% 55%)', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Area type="monotone" dataKey="ventas" stroke="#2e9e9b" strokeWidth={2} fill="url(#gradVentas)" />
          <Area type="monotone" dataKey="monto" stroke="#818cf8" strokeWidth={1.5} fill="none" strokeDasharray="4 2" />
        </AreaChart>
      ) : (
        <BarChart data={data ?? []} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 14% 18%)" />
          <XAxis dataKey="hora" tick={{ fill: 'hsl(215 16% 55%)', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'hsl(215 16% 55%)', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="ventas" fill="#2e9e9b" opacity={0.85} radius={[3, 3, 0, 0]} />
        </BarChart>
      )}
    </ResponsiveContainer>
  );
}
