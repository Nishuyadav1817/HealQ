import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartCard from '../../../../components/ui/ChartCard';

const formatDateTick = (value) => value?.slice(5);
const formatCurrency = (value) => `₹${value.toLocaleString('en-IN')}`;

/** Revenue collected per day (successful payments only) over the
 * selected range. */
const RevenueTrendChart = ({ data = [], title = 'Revenue Collected', subtitle }) => (
  <ChartCard title={title} subtitle={subtitle}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDateTick}
          tick={{ fontSize: 11, fill: '#98A2B3' }}
          axisLine={{ stroke: '#E4E7EC' }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => `₹${v}`}
          tick={{ fontSize: 11, fill: '#98A2B3' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value) => [formatCurrency(value), 'Revenue']}
          contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#E4E7EC' }}
        />
        <Bar dataKey="revenue" name="Revenue" fill="#0F8C82" radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  </ChartCard>
);

export default RevenueTrendChart;
