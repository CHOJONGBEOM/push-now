import React from 'react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';

const data = [
  { name: 'MON', value: 400 },
  { name: 'TUE', value: 600 },
  { name: 'WED', value: 750 },
  { name: 'THU', value: 450 },
  { name: 'FRI', value: 1240 }, // Peak
  { name: 'SAT', value: 500 },
  { name: 'SUN', value: 300 },
];

export const VolumeChart: React.FC = () => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 500, letterSpacing: '0.1em' }} 
          dy={10}
        />
        <Tooltip 
          cursor={{ fill: 'transparent' }}
          contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '4px', color: '#fff' }}
          itemStyle={{ color: '#fff', fontSize: '12px' }}
        />
        <Bar dataKey="value" radius={[2, 2, 0, 0]}>
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.name === 'FRI' ? '#000000' : '#e5e7eb'} 
              className="transition-all duration-300 hover:opacity-80"
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};