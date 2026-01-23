import { useState, useEffect } from 'react';
import axios from '../Utils/axiosApi';
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
  Tooltip,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Divider,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup
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
  Timeline,
  Delete,
  DriveFileMove,
  Lock,
  Public,
  Sync,
  Send,
  Warning,
  DataUsage,
  FolderOpen,
  CloudQueue
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';



const GoogleDriveDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const [commandLoading, setCommandLoading] = useState(false);
  const [commandError, setCommandError] = useState(null);
  const [commandSuccess, setCommandSuccess] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');
  const [chartType, setChartType] = useState('pie');
  const [formData, setFormData] = useState({
    action: '',
    fileId: '',
    feedId: '',
    targetFolderId: ''
  });

  const actions = [
    { value: 'DELETE_FILE', label: 'Delete File', icon: <Delete />, color: 'error', description: 'Permanently delete a file from Drive' },
    { value: 'MOVE_FILE', label: 'Move File', icon: <DriveFileMove />, color: 'primary', description: 'Move file to another folder' },
    { value: 'MAKE_PRIVATE', label: 'Make Private', icon: <Lock />, color: 'warning', description: 'Remove public access' },
    { value: 'MAKE_PUBLIC', label: 'Make Public', icon: <Public />, color: 'success', description: 'Make file publicly accessible' },
    { value: 'RESYNC', label: 'Resync Status', icon: <Sync />, color: 'info', description: 'Resync file status with database' },
  ];

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.get(`/api/admin/drive/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
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

  const executeCommand = async () => {
    setCommandLoading(true);
    setCommandError(null);
    setCommandSuccess(null);

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.post(`/api/admin/drive/command`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setCommandSuccess(response.data.message);
        setFormData({ action: '', fileId: '', feedId: '', targetFolderId: '' });
        setSelectedAction('');
        fetchDashboardData();
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      setCommandError(err.message || 'Command failed');
    } finally {
      setCommandLoading(false);
      setDialogOpen(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [refreshCount]);

  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1);
  };

  const handleActionChange = (event) => {
    const action = event.target.value;
    setSelectedAction(action);
    setFormData({ ...formData, action });
  };

  const handleInputChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleOpenDialog = () => {
    if (!formData.action) {
      setCommandError('Please select an action first');
      return;
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCommandError(null);
  };

  const handleChartTypeChange = (event, newChartType) => {
    if (newChartType !== null) {
      setChartType(newChartType);
    }
  };

  const getRequiredFields = () => {
    const baseFields = ['fileId'];
    switch (selectedAction) {
      case 'DELETE_FILE':
      case 'MAKE_PRIVATE':
      case 'MAKE_PUBLIC':
        return baseFields;
      case 'MOVE_FILE':
        return [...baseFields, 'targetFolderId'];
      case 'RESYNC':
        return ['fileId', 'feedId'];
      default:
        return [];
    }
  };

  const getActionDescription = () => {
    const action = actions.find(a => a.value === selectedAction);
    return action ? action.description : '';
  };

  const isFormValid = () => {
    const requiredFields = getRequiredFields();
    return requiredFields.every(field => formData[field]?.trim());
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !dashboardData) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        {error || 'No data available'}
      </Alert>
    );
  }

  const storage = dashboardData.storage;
  const usagePercent = parseFloat(storage.usagePercent) || 0;
  
  const getProgressColor = (percent) => {
    if (percent < 70) return 'success';
    if (percent < 90) return 'warning';
    return 'error';
  };

  const pieData = [
    { name: 'Admin Images', value: parseFloat(dashboardData.roles.admin.imagesGB), color: '#8884d8' },
    { name: 'Admin Videos', value: parseFloat(dashboardData.roles.admin.videosGB), color: '#82ca9d' },
    { name: 'Child Admin Images', value: parseFloat(dashboardData.roles.childAdmin.imagesGB), color: '#ffc658' },
    { name: 'Child Admin Videos', value: parseFloat(dashboardData.roles.childAdmin.videosGB), color: '#ff8042' },
    { name: 'User Images', value: parseFloat(dashboardData.roles.users.imagesGB), color: '#0088fe' },
    { name: 'User Videos', value: parseFloat(dashboardData.roles.users.videosGB), color: '#00c49f' },
  ];

  const barData = [
    {
      role: 'Admin',
      images: parseFloat(dashboardData.roles.admin.imagesGB),
      videos: parseFloat(dashboardData.roles.admin.videosGB),
      total: parseFloat(dashboardData.roles.admin.imagesGB) + parseFloat(dashboardData.roles.admin.videosGB)
    },
    {
      role: 'Child Admin',
      images: parseFloat(dashboardData.roles.childAdmin.imagesGB),
      videos: parseFloat(dashboardData.roles.childAdmin.videosGB),
      total: parseFloat(dashboardData.roles.childAdmin.imagesGB) + parseFloat(dashboardData.roles.childAdmin.videosGB)
    },
    {
      role: 'Users',
      images: parseFloat(dashboardData.roles.users.imagesGB),
      videos: parseFloat(dashboardData.roles.users.videosGB),
      total: parseFloat(dashboardData.roles.users.imagesGB) + parseFloat(dashboardData.roles.users.videosGB)
    }
  ];

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
            <Tooltip title="Refresh Data">
              <IconButton onClick={handleRefresh} color="primary">
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* Storage Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
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

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <FolderOpen sx={{ fontSize: 40, color: '#ff9800', mr: 2 }} />
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {Object.values(dashboardData.roles).reduce((sum, role) => sum + role.files, 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Files
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" justifyContent="space-between" mt={2}>
                {Object.entries(dashboardData.roles).map(([role, roleData]) => (
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

        <Grid item xs={12} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <DataUsage sx={{ fontSize: 40, color: '#9c27b0', mr: 2 }} />
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {dashboardData.usage.imagesGB} GB
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Images Data
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ bgcolor: '#f3e5f5', p: 2, borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Videos: {dashboardData.usage.videosGB} GB
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts and Usage */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
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
                    <RechartsTooltip formatter={(value) => [`${value} GB`, 'Size']} />
                    <Legend />
                  </PieChart>
                ) : (
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="role" />
                    <YAxis label={{ value: 'GB', angle: -90, position: 'insideLeft' }} />
                    <RechartsTooltip formatter={(value) => [`${value} GB`, '']} />
                    <Legend />
                    <Bar dataKey="images" name="Images" fill="#8884d8" />
                    <Bar dataKey="videos" name="Videos" fill="#82ca9d" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </Box>
          </Paper>
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
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Drive Commands
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Execute administrative commands on Google Drive files
            </Typography>

            <Box sx={{ mt: 3 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Action</InputLabel>
                <Select
                  value={selectedAction}
                  onChange={handleActionChange}
                  label="Select Action"
                >
                  {actions.map((action) => (
                    <MenuItem key={action.value} value={action.value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {action.icon}
                        {action.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedAction && (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {getActionDescription()}
                  </Typography>

                  <TextField
                    fullWidth
                    label="File ID"
                    value={formData.fileId}
                    onChange={handleInputChange('fileId')}
                    sx={{ mb: 2 }}
                    size="small"
                    required
                  />

                  {(selectedAction === 'MOVE_FILE' || selectedAction === 'RESYNC') && (
                    <TextField
                      fullWidth
                      label={selectedAction === 'MOVE_FILE' ? 'Target Folder ID' : 'Feed ID'}
                      value={selectedAction === 'MOVE_FILE' ? formData.targetFolderId : formData.feedId}
                      onChange={handleInputChange(selectedAction === 'MOVE_FILE' ? 'targetFolderId' : 'feedId')}
                      sx={{ mb: 2 }}
                      size="small"
                      required
                    />
                  )}

                  {selectedAction === 'DELETE_FILE' && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      <Warning fontSize="small" />
                      This action cannot be undone. The file will be permanently deleted.
                    </Alert>
                  )}

                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleOpenDialog}
                    disabled={!isFormValid() || commandLoading}
                    startIcon={<Send />}
                  >
                    Execute Command
                  </Button>
                </>
              )}

              {commandError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {commandError}
                </Alert>
              )}

              {commandSuccess && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  {commandSuccess}
                </Alert>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                Quick Actions
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {actions.map((action) => (
                  <Chip
                    key={action.value}
                    icon={action.icon}
                    label={action.label}
                    onClick={() => {
                      setSelectedAction(action.value);
                      setFormData({ ...formData, action: action.value });
                    }}
                    color={action.color}
                    variant={selectedAction === action.value ? 'filled' : 'outlined'}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Command Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>
          Confirm Action
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to execute{' '}
            <strong>{actions.find(a => a.value === selectedAction)?.label}</strong>?
          </Typography>
          {selectedAction === 'DELETE_FILE' && (
            <Alert severity="error" sx={{ mt: 2 }}>
              This action is irreversible. The file will be permanently deleted from Google Drive.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={commandLoading}>
            Cancel
          </Button>
          <Button
            onClick={executeCommand}
            variant="contained"
            color={selectedAction === 'DELETE_FILE' ? 'error' : 'primary'}
            disabled={commandLoading}
            startIcon={commandLoading ? <CircularProgress size={20} /> : null}
          >
            {commandLoading ? 'Executing...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GoogleDriveDashboard;