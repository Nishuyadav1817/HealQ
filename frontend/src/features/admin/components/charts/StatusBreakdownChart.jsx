import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ChartCard from '../../../../components/ui/ChartCard';

// Mirrors components/ui/Badge.jsx's status color mapping so the chart's
// legend colors mean the same thing as the status pills used everywhere
// else in the app.
const STATUS_COLORS = {
  pending: '#5B6B63',
  confirmed: '#147D4F',
  'checked-in': '#C48D0F',
  'in-consultation': '#146F6C',
  completed: '#147D4F',
  cancelled: '#D0362C',
  'no-show': '#D0362C',
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
    color: STATUS_COLORS[row.status] || '#5B6B63',
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
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#E3E7E2' }} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default StatusBreakdownChart;
