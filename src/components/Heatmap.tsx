import React from 'react';

type Level = 'MIN' | 'LOW' | 'MID' | 'DENSE' | 'PEAK';

interface CellData {
  level: Level;
}

const getColorClass = (level: Level) => {
  switch (level) {
    case 'MIN': return 'bg-gray-50 text-gray-300';
    case 'LOW': return 'bg-gray-100 text-gray-400';
    case 'MID': return 'bg-gray-300 text-white';
    case 'DENSE': return 'bg-gray-600 text-white';
    case 'PEAK': return 'bg-black text-white';
    default: return 'bg-gray-50 text-gray-300';
  }
};

const rows = [
  { label: 'GLOBAL MESSAGING', data: ['MIN', 'MID', 'DENSE', 'MID', 'PEAK', 'MID'] as Level[] },
  { label: 'RETAIL COMMERCE', data: ['MIN', 'MID', 'PEAK', 'DENSE', 'MID', 'MIN'] as Level[] },
  { label: 'MEDIA & DIGITAL', data: ['MID', 'PEAK', 'DENSE', 'MID', 'LOW', 'MIN'] as Level[] },
];

const columns = ['00 - 04', '04 - 08', '08 - 12', '12 - 16', '16 - 20', '20 - 24'];

export const Heatmap: React.FC = () => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-[600px] border-collapse">
        <thead>
          <tr>
            <th className="p-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] w-1/4 border-b border-r border-border">
              Ecosystem Segment
            </th>
            {columns.map((col, i) => (
              <th key={col} className={`p-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] border-b border-border ${i !== columns.length - 1 ? 'border-r' : ''}`}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.label} className={rowIndex !== rows.length - 1 ? 'border-b border-border' : ''}>
              <td className="p-6 text-[11px] font-medium text-gray-700 uppercase tracking-widest border-r border-border">
                {row.label}
              </td>
              {row.data.map((level, colIndex) => (
                <td key={colIndex} className={`p-1 h-20 border-border ${colIndex !== columns.length - 1 ? 'border-r' : ''}`}>
                  <div className={`w-full h-full flex items-center justify-center text-[9px] font-semibold tracking-wider ${getColorClass(level)} transition-all duration-300 hover:scale-[0.98]`}>
                    {level}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};