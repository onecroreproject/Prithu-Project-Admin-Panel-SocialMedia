
import {
  Paper,
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { useState } from 'react';

const DriveUsageChart = ({ data }) => {
  const [chartType, setChartType] = useState('pie');

  // Prepare pie chart data
  const pieData = [
    { name: 'Admin Images', value: parseFloat(data.roles.admin.imagesGB), color: '#8884d8' },
    { name: 'Admin Videos', value: parseFloat(data.roles.admin.videosGB), color: '#82ca9d' },
    { name: 'Child Admin Images', value: parseFloat(data.roles.childAdmin.imagesGB), color: '#ffc658' },
    { name: 'Child Admin Videos', value: parseFloat(data.roles.childAdmin.videosGB), color: '#ff8042' },
    { name: 'User Images', value: parseFloat(data.roles.users.imagesGB), color: '#0088fe' },
    { name: 'User Videos', value: parseFloat(data.roles.users.videosGB), color: '#00c49f' },
  ];

  // Prepare bar chart data
  const barData = [
    {
      role: 'Admin',
      images: parseFloat(data.roles.admin.imagesGB),
      videos: parseFloat(data.roles.admin.videosGB),
      total: parseFloat(data.roles.admin.imagesGB) + parseFloat(data.roles.admin.videosGB)
    },
    {
      role: 'Child Admin',
      images: parseFloat(data.roles.childAdmin.imagesGB),
      videos: parseFloat(data.roles.childAdmin.videosGB),
      total: parseFloat(data.roles.childAdmin.imagesGB) + parseFloat(data.roles.childAdmin.videosGB)
    },
    {
      role: 'Users',
      images: parseFloat(data.roles.users.imagesGB),
      videos: parseFloat(data.roles.users.videosGB),
      total: parseFloat(data.roles.users.imagesGB) + parseFloat(data.roles.users.videosGB)
    }
  ];

  const handleChartTypeChange = (event, newChartType) => {
    if (newChartType !== null) {
      setChartType(newChartType);
    }
  };

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight="bold">
          Storage Distribution
        </Typography>
        <ToggleButtonGroup
          value={chartType}
          exclusive
          onChange={handleChartTypeChange}
          size="small"
        >
          <ToggleButton value="pie">Pie Chart</ToggleButton>
          <ToggleButton value="bar">Bar Chart</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'pie' ? (
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} GB`, 'Size']} />
              <Legend />
            </PieChart>
          ) : (
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="role" />
              <YAxis label={{ value: 'GB', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => [`${value} GB`, '']} />
              <Legend />
              <Bar dataKey="images" name="Images" fill="#8884d8" />
              <Bar dataKey="videos" name="Videos" fill="#82ca9d" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </Box>

      <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>Total Storage:</strong> {data.storage.usedGB} GB used of {data.storage.limitGB} GB
        </Typography>
      </Box>
    </Paper>
  );
};

export default DriveUsageChart;