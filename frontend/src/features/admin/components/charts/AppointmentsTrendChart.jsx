import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartCard from '../../../../components/ui/ChartCard';

const formatDateTick = (value) => value?.slice(5); // "MM-DD"

/** Appointments booked per day over the selected range — the primary
 * "is volume trending up or down" chart on Overview/Analytics. */
const AppointmentsTrendChart = ({ data = [], title = 'Appointments Over Time', subtitle }) => (
  <ChartCard title={title} subtitle={subtitle}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDateTick}
          tick={{ fontSize: 11, fill: '#98A2B3' }}
          axisLine={{ stroke: '#E4E7EC' }}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: '#98A2B3' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          labelFormatter={(value) => value}
          contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#E4E7EC' }}
        />
        <Line
          type="monotone"
          dataKey="count"
          name="Appointments"
          stroke="#0F8C82"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </ChartCard>
);

export default AppointmentsTrendChart;
