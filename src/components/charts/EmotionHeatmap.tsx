import { memo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import type { EmotionFrequency } from '../../services/analytics/moodEngine';

const EMOTION_COLORS: Record<string, string> = {
  anxiety: '#f97316',
  frustration: '#ef4444',
  panic: '#dc2626',
  sadness: '#3b82f6',
  self_doubt: '#8b5cf6',
  hope: '#22c55e',
  motivation: '#10b981',
  confidence: '#7c3aed',
  calm: '#06b6d4',
  focus: '#a78bfa',
  pressure: '#f59e0b',
  guilt: '#6b7280',
};

interface EmotionHeatmapProps {
  data: EmotionFrequency[];
}

function CustomBar(props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  emotion?: string;
}) {
  const { x = 0, y = 0, width = 0, height = 0, emotion = '' } = props;
  const color = EMOTION_COLORS[emotion] ?? '#6b7280';
  return <rect x={x} y={y} width={width} height={height} fill={color} fillOpacity={0.8} rx={4} />;
}

export function EmotionHeatmapInner({ data }: EmotionHeatmapProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-white/30 text-sm">
        No emotion data yet.
      </div>
    );
  }

  const chartData = data.map((d) => ({ ...d, emotion: d.emotion.replace(/_/g, ' ') }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ left: 10, right: 20, top: 5, bottom: 5 }}
      >
        <XAxis
          type="number"
          tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="emotion"
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={80}
        />
        <Tooltip
          contentStyle={{
            background: 'rgba(15,10,30,0.9)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
          }}
          itemStyle={{ color: '#e2d9f3' }}
          labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
          formatter={(val) => [`${val} occurrences`, 'Count']}
        />
        <Bar dataKey="count" shape={<CustomBar />} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export const EmotionHeatmap = memo(EmotionHeatmapInner);
