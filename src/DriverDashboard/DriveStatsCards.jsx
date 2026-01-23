
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Grid
} from '@mui/material';
import {
  Storage,
  DataUsage,
  FolderOpen,
  CloudQueue
} from '@mui/icons-material';

const DriveStatsCards = ({ data }) => {
  const storage = data.storage;
  const usagePercent = parseFloat(storage.usagePercent) || 0;

  const getProgressColor = (percent) => {
    if (percent < 70) return 'success';
    if (percent < 90) return 'warning';
    return 'error';
  };

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {/* Total Storage Card */}
      <Grid item xs={12} md={3}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Storage sx={{ fontSize: 40, color: '#3f51b5', mr: 2 }} />
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {storage.usedGB} GB
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Used of {storage.limitGB} GB
                </Typography>
              </Box>
            </Box>
            <LinearProgress
              variant="determinate"
              value={usagePercent}
              color={getProgressColor(usagePercent)}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="caption" display="block" textAlign="center" mt={1}>
              {usagePercent.toFixed(1)}% Used
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Free Space Card */}
      <Grid item xs={12} md={3}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <CloudQueue sx={{ fontSize: 40, color: '#4caf50', mr: 2 }} />
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {storage.freeGB} GB
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Available Space
                </Typography>
              </Box>
            </Box>
            <Box sx={{ bgcolor: '#e8f5e9', p: 2, borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {((parseFloat(storage.freeGB) / parseFloat(storage.limitGB)) * 100).toFixed(1)}% Free
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Total Files Card */}
      <Grid item xs={12} md={3}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <FolderOpen sx={{ fontSize: 40, color: '#ff9800', mr: 2 }} />
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {Object.values(data.roles).reduce((sum, role) => sum + role.files, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Files
                </Typography>
              </Box>
            </Box>
            <Box display="flex" justifyContent="space-between" mt={2}>
              {Object.entries(data.roles).map(([role, roleData]) => (
                <Box key={role} textAlign="center">
                  <Typography variant="caption" display="block" color="text.secondary">
                    {role.charAt(0)}
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {roleData.files}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Data Usage Card */}
      <Grid item xs={12} md={3}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <DataUsage sx={{ fontSize: 40, color: '#9c27b0', mr: 2 }} />
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {data.usage.imagesGB} GB
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Images Data
                </Typography>
              </Box>
            </Box>
            <Box sx={{ bgcolor: '#f3e5f5', p: 2, borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Videos: {data.usage.videosGB} GB
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default DriveStatsCards;