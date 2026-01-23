import { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Stack,
  Chip,
  Divider
} from '@mui/material';
import {
  Delete,
  DriveFileMove,
  Lock,
  Public,
  Sync,
  Send,
  Warning
} from '@mui/icons-material';
import { driveApi } from '../Services/Driver/driverApi';

const DriveCommandsPanel = ({ onCommandSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');
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
      setError('Please select an action first');
      return;
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setError(null);
  };

  const executeCommand = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await driveApi.executeCommand(formData);
      if (response.data.success) {
        setSuccess(response.data.message);
        setFormData({ action: '', fileId: '', feedId: '', targetFolderId: '' });
        setSelectedAction('');
        onCommandSuccess();
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      setError(err.message || 'Command failed');
    } finally {
      setLoading(false);
      setDialogOpen(false);
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

  return (
    <>
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
                disabled={!isFormValid() || loading}
                startIcon={<Send />}
              >
                Execute Command
              </Button>
            </>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {success}
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
          <Button onClick={handleCloseDialog} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={executeCommand}
            variant="contained"
            color={selectedAction === 'DELETE_FILE' ? 'error' : 'primary'}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Executing...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DriveCommandsPanel;