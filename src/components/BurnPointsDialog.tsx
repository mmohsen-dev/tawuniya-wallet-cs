'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Alert,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import { serviceAPI, walletAPI, configAPI } from '@/lib/api';

interface Service {
  id: string;
  name: string;
}

interface BurnPointsDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  currentBalance: number;
}

export default function BurnPointsDialog({ 
  open, 
  onClose, 
  onSuccess, 
  userId, 
  currentBalance 
}: BurnPointsDialogProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    points: '',
    serviceId: '',
  });
  const [error, setError] = useState('');
  const [sarValue, setSarValue] = useState(0);
  const [burnRate, setBurnRate] = useState(1);

  useEffect(() => {
    if (open) {
      fetchServices();
      fetchBurnRate();
    }
  }, [open]);

  useEffect(() => {
    // Calculate SAR value based on burn rate
    setSarValue((parseFloat(formData.points) || 0) * burnRate);
  }, [formData.points, burnRate]);

  const fetchServices = async () => {
    try {
      const response = await serviceAPI.getServices('burn');
      setServices(response.data.services);
    } catch {
      setError('Failed to fetch services');
    }
  };

  const fetchBurnRate = async () => {
    try {
      const response = await configAPI.getPublicConfigurations();
      const rate = parseFloat(response.data.configurations.burn_rate || '1');
      setBurnRate(rate);
    } catch {
      // Default to 1:1 if fetch fails
      setBurnRate(1);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    setError('');
    
    if (!formData.points || !formData.serviceId) {
      setError('Please fill in all required fields');
      return;
    }

    const points = parseInt(formData.points);
    
    if (points <= 0) {
      setError('Points must be greater than 0');
      return;
    }

    if (points > currentBalance) {
      setError(`Insufficient balance. You have ${currentBalance} points`);
      return;
    }

    setLoading(true);

    try {
      await walletAPI.burnPoints(
        userId,
        points,
        formData.serviceId
      );
      
      setFormData({ points: '', serviceId: '' });
      onSuccess();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to use points');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ points: '', serviceId: '' });
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Use Points</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Available Balance: <strong>{currentBalance} points</strong>
          </Alert>

          <TextField
            fullWidth
            type="number"
            label="Points to Use"
            name="points"
            value={formData.points}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
            inputProps={{ min: 1, max: currentBalance, step: 1 }}
          />

          <TextField
            select
            fullWidth
            label="Select Service"
            name="serviceId"
            value={formData.serviceId}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          >
            {services.map((service) => (
              <MenuItem key={service.id} value={service.id}>
                {service.name}
              </MenuItem>
            ))}
          </TextField>

          {sarValue > 0 && (
            <Box
              sx={{
                p: 2,
                bgcolor: 'warning.light',
                borderRadius: 1,
                textAlign: 'center',
              }}
            >
              <Typography variant="h6" color="warning.dark">
                SAR Value: {sarValue.toFixed(2)} SAR
              </Typography>
              <Typography variant="caption">
                1 point = {burnRate} SAR
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="warning"
          disabled={loading || !formData.points || !formData.serviceId}
        >
          {loading ? <CircularProgress size={24} /> : 'Use Points'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

