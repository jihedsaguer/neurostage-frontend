interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  title: string;
  maxValue?: number;
}

export function SimpleBarChart({ data, title, maxValue }: BarChartProps) {
  const max = maxValue ?? Math.max(...data.map(d => d.value), 1);
  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-3">{title}</p>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-16 text-right shrink-0 truncate">{item.label}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${item.color ?? 'bg-blue-500'}`}
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-700 w-8">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
