import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Storage,
  Folder,
  InsertDriveFile,
  Refresh,
  Cloud,
  People,
  VideoFile,
  Image,
  Timeline
} from '@mui/icons-material';
import DriveStatsCards from './DriveStatsCards';
import DriveUsageChart from './DriveUsageChart';
import DriveCommandsPanel from './DriveCommandsPanel';
import { driveApi } from '../Services/Driver/driverApi';

const DriveDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await driveApi.getDashboard();
      if (response.data.success) {
        setDashboardData(response.data);
        setError(null);
      } else {
        throw new Error(response.data.message || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err.message || 'Failed to load Drive dashboard');
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [refreshCount]);

  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!dashboardData) return null;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Storage sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Google Drive Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {dashboardData.driveAccount}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={2} alignItems="center">
            <Chip
              icon={<Cloud />}
              label={dashboardData.oauth.mode === 'testing' ? 'Test Mode' : 'Production'}
              color={dashboardData.oauth.mode === 'testing' ? 'warning' : 'success'}
              variant="outlined"
            />

          </Box>
        </Box>
      </Box>

      {/* Storage Overview */}
      <DriveStatsCards data={dashboardData} />

      {/* Charts and Usage */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <DriveUsageChart data={dashboardData} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              <Timeline sx={{ mr: 1, verticalAlign: 'middle' }} />
              Usage by Type
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center">
                  <Image sx={{ mr: 1, color: '#2196f3' }} />
                  <Typography>Images</Typography>
                </Box>
                <Typography fontWeight="bold">
                  {dashboardData.usage.imagesGB} GB
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center">
                  <VideoFile sx={{ mr: 1, color: '#f44336' }} />
                  <Typography>Videos</Typography>
                </Box>
                <Typography fontWeight="bold">
                  {dashboardData.usage.videosGB} GB
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Roles Usage */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          <People sx={{ mr: 1, verticalAlign: 'middle' }} />
          Usage by Role
        </Typography>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {Object.entries(dashboardData.roles).map(([role, data]) => (
            <Grid item xs={12} md={4} key={role}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ textTransform: 'capitalize' }}>
                    {role.replace(/([A-Z])/g, ' $1').trim()}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Images:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {data.imagesGB} GB
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Videos:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {data.videosGB} GB
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Total Files:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {data.files}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Recent Uploads and Commands */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              <InsertDriveFile sx={{ mr: 1, verticalAlign: 'middle' }} />
              Recent Uploads
            </Typography>
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {dashboardData.recentUploads.map((file, index) => (
                <Box
                  key={file.id}
                  sx={{
                    p: 2,
                    borderBottom: index < dashboardData.recentUploads.length - 1 ? '1px solid #eee' : 'none',
                    '&:hover': { backgroundColor: '#f5f5f5' }
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {file.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(file.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Chip
                        label={file.type}
                        size="small"
                        color={file.type === 'video' ? 'error' : 'primary'}
                        variant="outlined"
                      />
                      <Typography variant="body2">
                        {file.sizeMB} MB
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <DriveCommandsPanel onCommandSuccess={fetchDashboardData} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DriveDashboard;