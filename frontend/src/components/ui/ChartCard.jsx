import Card from './Card';

/**
 * Generic chart frame reused by every chart on the Admin Overview/
 * Analytics tabs — owns the title/subtitle header and the fixed-height
 * container recharts' ResponsiveContainer needs, so each individual
 * chart component only has to supply its own <LineChart>/<BarChart>/etc.
 */
const ChartCard = ({ title, subtitle, height = 260, action = null, children }) => (
  <Card className="flex flex-col">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-ink-subtle">{subtitle}</p>}
      </div>
      {action}
    </div>
    <div className="mt-4" style={{ height }}>
      {children}
    </div>
  </Card>
);

export default ChartCard;
