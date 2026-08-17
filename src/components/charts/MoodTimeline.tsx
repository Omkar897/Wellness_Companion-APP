import { memo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { MoodDataPoint } from '../../services/analytics/moodEngine';

interface MoodTimelineProps {
  data: MoodDataPoint[];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div className="glass rounded-lg px-3 py-2 text-sm">
      <p className="text-white/60 text-xs mb-1">{label}</p>
      <p className="text-white font-medium">Stress: {val}/10</p>
    </div>
  );
}

export function MoodTimelineInner({ data }: MoodTimelineProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-white/30 text-sm">
        No mood data yet. Start journaling!
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <defs>
          <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="date"
          tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
          tickFormatter={(v: string) => v.slice(5)}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 10]}
          tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="severity"
          stroke="#7c3aed"
          strokeWidth={2}
          fill="url(#moodGradient)"
          dot={{ fill: '#7c3aed', r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#a78bfa' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export const MoodTimeline = memo(MoodTimelineInner);
