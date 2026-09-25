import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartCard from '../../../../components/ui/ChartCard';

/** Reused for both "top hospitals by volume" and "top departments by
 * volume" — same shape ({ name, count }), just a different data source
 * and title from the caller. */
const VolumeBarChart = ({ data = [], title, subtitle, barColor = '#33449E' }) => {
  const height = Math.max(data.length * 36, 180);

  return (
    <ChartCard title={title} subtitle={subtitle} height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E4E7EC" horizontal={false} />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#98A2B3' }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tick={{ fontSize: 11, fill: '#101828' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: '#E4E7EC' }} />
          <Bar dataKey="count" name="Appointments" fill={barColor} radius={[0, 4, 4, 0]} maxBarSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

export default VolumeBarChart;
