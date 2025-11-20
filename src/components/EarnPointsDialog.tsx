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
import { serviceAPI, walletAPI } from '@/lib/api';

interface Service {
  id: string;
  name: string;
  earnRate: number;
  earnRateDescription?: string;
}

interface EarnPointsDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

export default function EarnPointsDialog({ open, onClose, onSuccess, userId }: EarnPointsDialogProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    serviceId: '',
    sarAmount: '',
  });
  const [error, setError] = useState('');
  const [pointsToEarn, setPointsToEarn] = useState(0);

  useEffect(() => {
    if (open) {
      fetchServices();
    }
  }, [open]);

  useEffect(() => {
    calculatePoints();
  }, [formData.serviceId, formData.sarAmount, services]);

  const fetchServices = async () => {
    try {
      const response = await serviceAPI.getServices('earn');
      // Handle new standardized response format: { success, data: { services } }
      // or fallback to old format: { services }
      const responseData = response.data;
      const servicesData = responseData.success && responseData.data
        ? responseData.data.services || []
        : responseData.services || [];
      setServices(servicesData);
    } catch (err) {
      setError('Failed to fetch services');
      setServices([]); // Set empty array on error
    }
  };

  const calculatePoints = () => {
    if (!formData.serviceId || !formData.sarAmount) {
      setPointsToEarn(0);
      return;
    }

    const service = services.find((s) => s.id === formData.serviceId);
    if (service && service.earnRate) {
      const points = Math.floor((parseFloat(formData.sarAmount) / 100) * service.earnRate);
      setPointsToEarn(points);
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
    
    if (!formData.serviceId || !formData.sarAmount) {
      setError('Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.sarAmount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    setLoading(true);

    try {
      await walletAPI.earnPoints(
        userId,
        formData.serviceId,
        parseFloat(formData.sarAmount)
      );
      
      setFormData({ serviceId: '', sarAmount: '' });
      onSuccess();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to earn points');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ serviceId: '', sarAmount: '' });
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Earn Points</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 2 }}>
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
                {service.name} - {service.earnRate} points per 100 SAR
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            type="number"
            label="Amount Spent (SAR)"
            name="sarAmount"
            value={formData.sarAmount}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
            inputProps={{ min: 0, step: 0.01 }}
          />

          {pointsToEarn > 0 && (
            <Box
              sx={{
                p: 2,
                bgcolor: 'success.light',
                borderRadius: 1,
                textAlign: 'center',
              }}
            >
              <Typography variant="h6" color="success.dark">
                You will earn: {pointsToEarn} points
              </Typography>
              <Typography variant="caption">
                Points expire in 180 days
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
          color="success"
          disabled={loading || pointsToEarn === 0}
        >
          {loading ? <CircularProgress size={24} /> : 'Earn Points'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

