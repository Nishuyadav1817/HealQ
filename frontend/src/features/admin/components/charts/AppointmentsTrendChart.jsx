import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartCard from '../../../../components/ui/ChartCard';

const formatDateTick = (value) => value?.slice(5); // "MM-DD"

/** Appointments booked per day over the selected range — the primary
 * "is volume trending up or down" chart on Overview/Analytics. */
const AppointmentsTrendChart = ({ data = [], title = 'Appointments Over Time', subtitle }) => (
  <ChartCard title={title} subtitle={subtitle}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E3E7E2" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDateTick}
          tick={{ fontSize: 11, fill: '#94A299' }}
          axisLine={{ stroke: '#E3E7E2' }}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: '#94A299' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          labelFormatter={(value) => value}
          contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#E3E7E2' }}
        />
        <Line
          type="monotone"
          dataKey="count"
          name="Appointments"
          stroke="#146F6C"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </ChartCard>
);

export default AppointmentsTrendChart;
