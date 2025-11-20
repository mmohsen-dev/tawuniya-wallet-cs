'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import SettingsIcon from '@mui/icons-material/Settings';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/lib/api';
import { format } from 'date-fns';

export default function AdminPage() {
  const router = useRouter();
  const { isAdmin, isAuthenticated, loading: authLoading, logout } = useAuth();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/login');
    } else if (isAuthenticated && isAdmin) {
      fetchDashboard();
    }
  }, [isAuthenticated, isAdmin, authLoading, router]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboard();
      setDashboard(response.data);
      setError('');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (authLoading || loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error && !dashboard) {
    return (
      <>
        <AppBar position="static">
          <Toolbar>
            <IconButton color="inherit" onClick={() => router.push('/dashboard')}>
              <ArrowBackIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', ml: 2 }}>
              <Image
                src="/tawuniya-logo.svg"
                alt="Tawuniya Logo"
                width={120}
                height={40}
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <DashboardIcon sx={{ ml: 2, mr: 1 }} />
              <Typography variant="h6" component="span">
                Admin Dashboard
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>
        <Container>
          <Alert severity="error" sx={{ mt: 4 }}>
            {error}
          </Alert>
        </Container>
      </>
    );
  }

  const kpis = dashboard?.kpis || {};
  const recentTransactions = dashboard?.recentTransactions || [];
  const topUsers = dashboard?.topUsers || [];

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton color="inherit" onClick={() => router.push('/dashboard')}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', ml: 2 }}>
            <Image
              src="/tawuniya-logo.svg"
              alt="Tawuniya Logo"
              width={120}
              height={40}
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            <DashboardIcon sx={{ ml: 2, mr: 1 }} />
            <Typography variant="h6" component="span">
              Admin Dashboard
            </Typography>
          </Box>
          <Button
            color="inherit"
            startIcon={<SettingsIcon />}
            onClick={() => router.push('/admin/configurations')}
            sx={{ mr: 2 }}
          >
            Configurations
          </Button>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          System overview and key performance indicators
        </Typography>

        {/* KPI Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccountBalanceWalletIcon sx={{ mr: 1 }} />
                  <Typography variant="body2">Active Wallets</Typography>
                </Box>
                <Typography variant="h4">{kpis.activeWallets || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUpIcon sx={{ mr: 1 }} />
                  <Typography variant="body2">Total Earned</Typography>
                </Box>
                <Typography variant="h4">{kpis.totalPointsEarned || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingDownIcon sx={{ mr: 1 }} />
                  <Typography variant="body2">Total Burned</Typography>
                </Box>
                <Typography variant="h4">{kpis.totalPointsBurned || 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Additional Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Points in Circulation
                </Typography>
                <Typography variant="h3" color="primary">
                  {kpis.totalPointsInCirculation || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Current active points
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EventBusyIcon sx={{ mr: 1, color: 'error.main' }} />
                  <Typography variant="h6">
                    Expired Points
                  </Typography>
                </Box>
                <Typography variant="h3" color="error.main">
                  {kpis.expiredPoints || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total points expired
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Transactions
                </Typography>
                <Typography variant="h3" color="primary">
                  {kpis.totalTransactions || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {kpis.earnTransactions || 0} earn / {kpis.burnTransactions || 0} burn
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Top Users */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Top Users by Balance
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="right">Balance</TableCell>
                  <TableCell align="right">Total Earned</TableCell>
                  <TableCell align="right">Total Burned</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topUsers.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.user.name}</TableCell>
                    <TableCell>{item.user.email}</TableCell>
                    <TableCell align="right">
                      <Chip label={item.balance} color="primary" />
                    </TableCell>
                    <TableCell align="right">{item.totalEarned}</TableCell>
                    <TableCell align="right">{item.totalBurned}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Recent Transactions */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recent Transactions
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell align="right">Points</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentTransactions.map((transaction: any) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.createdAt), 'MMM dd, HH:mm')}
                    </TableCell>
                    <TableCell>{transaction.user.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.type}
                        color={transaction.type === 'earn' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{transaction.service?.name || 'N/A'}</TableCell>
                    <TableCell align="right">
                      <Typography
                        sx={{
                          color: transaction.type === 'earn' ? 'success.main' : 'error.main',
                          fontWeight: 'bold',
                        }}
                      >
                        {transaction.type === 'earn' ? '+' : '-'}
                        {transaction.amount}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </>
  );
}

