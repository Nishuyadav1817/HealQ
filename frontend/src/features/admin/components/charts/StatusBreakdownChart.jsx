import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ChartCard from '../../../../components/ui/ChartCard';

// Mirrors components/ui/Badge.jsx's status color mapping so the chart's
// legend colors mean the same thing as the status pills used everywhere
// else in the app.
const STATUS_COLORS = {
  pending: '#98A2B3',
  confirmed: '#0F8C82',
  'checked-in': '#B5560F',
  'in-consultation': '#33449E',
  completed: '#0F8C5C',
  cancelled: '#D92D20',
  'no-show': '#D92D20',
};

const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  'checked-in': 'Checked In',
  'in-consultation': 'In Consultation',
  completed: 'Completed',
  cancelled: 'Cancelled',
  'no-show': 'No Show',
};

const StatusBreakdownChart = ({ data = [], title = 'Appointments by Status', subtitle }) => {
  const chartData = data.map((row) => ({
    name: STATUS_LABELS[row.status] || row.status,
    value: row.count,
    color: STATUS_COLORS[row.status] || '#98A2B3',
  }));

  return (
    <ChartCard title={title} subtitle={subtitle}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={2}
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#E4E7EC' }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default StatusBreakdownChart;
