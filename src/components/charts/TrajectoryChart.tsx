import React from 'react';
import { LineChart, Line, XAxis, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: 'PHASE 01', urgency: 30, value: 40, innovation: 20 },
  { name: 'PHASE 02', urgency: 45, value: 35, innovation: 60 },
  { name: 'PHASE 03', urgency: 40, value: 55, innovation: 50 },
  { name: 'PHASE 04', urgency: 60, value: 70, innovation: 45 },
  { name: 'FINAL REPORT', urgency: 75, value: 50, innovation: 65 },
];

export const TrajectoryChart: React.FC = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 9, fill: '#cbd5e1', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }} 
          dy={20}
          interval="preserveStartEnd"
        />
        <Tooltip 
          contentStyle={{ backgroundColor: '#fff', border: '1px solid #f3f4f6', borderRadius: '4px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          labelStyle={{ fontSize: '10px', color: '#9ca3af', fontWeight: 'bold', letterSpacing: '0.1em' }}
          itemStyle={{ fontSize: '11px', fontWeight: '500' }}
        />
        <Line type="monotone" dataKey="urgency" stroke="#000000" strokeWidth={1.5} dot={false} activeDot={{ r: 4 }} />
        <Line type="monotone" dataKey="value" stroke="#94a3b8" strokeWidth={1.5} dot={false} activeDot={{ r: 4 }} />
        <Line type="monotone" dataKey="innovation" stroke="#cbd5e1" strokeWidth={1.5} dot={false} activeDot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};