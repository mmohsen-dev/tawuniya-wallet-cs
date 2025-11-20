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
  Button,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TimerIcon from '@mui/icons-material/Timer';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuth } from '@/contexts/AuthContext';
import { walletAPI, transactionAPI } from '@/lib/api';
import TransactionHistory from '@/components/TransactionHistory';
import EarnPointsDialog from '@/components/EarnPointsDialog';
import BurnPointsDialog from '@/components/BurnPointsDialog';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, isAdmin, isAuthenticated, loading: authLoading } = useAuth();
  const [wallet, setWallet] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [earnDialogOpen, setEarnDialogOpen] = useState(false);
  const [burnDialogOpen, setBurnDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (isAuthenticated && user) {
      fetchWalletData();
    }
  }, [user, refreshTrigger, isAuthenticated, authLoading, router]);

  const fetchWalletData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [walletRes, summaryRes] = await Promise.all([
        walletAPI.getWallet(user.id),
        transactionAPI.getTransactionSummary(user.id),
      ]);

      // Handle new consistent response format { success, data: { wallet } }
      const wallet = walletRes.data.data?.wallet || walletRes.data.wallet;
      setWallet(wallet);
      
      // or fallback to old format: { summary, recentTransactions }
      const summaryData = summaryRes.data;
      const summary = summaryData.success && summaryData.data 
        ? summaryData.data.summary 
        : summaryData.summary;
      setSummary(summary);
      setError('');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to fetch wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
    setEarnDialogOpen(false);
    setBurnDialogOpen(false);
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

  if (!user) {
    return null;
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
            <Image
              src="/tawuniya-logo.svg"
              alt="Tawuniya Logo"
              width={120}
              height={40}
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          </Box>
          {isAdmin && (
            <Button
              color="inherit"
              startIcon={<AdminPanelSettingsIcon />}
              onClick={() => router.push('/admin')}
              sx={{ mr: 2 }}
            >
              Admin Panel
            </Button>
          )}
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Welcome back, {user?.name}!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your Tawuniya points and rewards
          </Typography>
        </Box>

        {/* Main Wallet Card */}
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 4,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AccountBalanceWalletIcon sx={{ fontSize: 40, mr: 2 }} />
            <Typography variant="h5">Your Wallet Balance</Typography>
          </Box>
          <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 3 }}>
            {wallet?.balance || 0} Points
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="success"
              onClick={() => setEarnDialogOpen(true)}
              sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' } }}
            >
              Earn Points
            </Button>
            <Button
              variant="contained"
              color="warning"
              onClick={() => setBurnDialogOpen(true)}
              disabled={!wallet?.balance || wallet.balance === 0}
              sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' } }}
            >
              Use Points
            </Button>
          </Box>
        </Paper>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                  <Typography color="text.secondary" variant="body2">
                    Total Earned
                  </Typography>
                </Box>
                <Typography variant="h5">{summary?.totalEarned || 0}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {summary?.earnTransactions || 0} transactions
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingDownIcon color="error" sx={{ mr: 1 }} />
                  <Typography color="text.secondary" variant="body2">
                    Total Burned
                  </Typography>
                </Box>
                <Typography variant="h5">{summary?.totalBurned || 0}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {summary?.burnTransactions || 0} transactions
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TimerIcon color="warning" sx={{ mr: 1 }} />
                  <Typography color="text.secondary" variant="body2">
                    Expiring Soon
                  </Typography>
                </Box>
                <Typography variant="h5">{summary?.expiringPoints || 0}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Next 30 days
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccountBalanceWalletIcon color="primary" sx={{ mr: 1 }} />
                  <Typography color="text.secondary" variant="body2">
                    Current Balance
                  </Typography>
                </Box>
                <Typography variant="h5">{wallet?.balance || 0}</Typography>
                <Typography variant="caption" color="text.secondary">
                  1 point = 1 SAR
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Transaction History */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Transaction History
          </Typography>
          <TransactionHistory userId={user.id} refreshTrigger={refreshTrigger} />
        </Paper>

        {/* Dialogs */}
        <EarnPointsDialog
          open={earnDialogOpen}
          onClose={() => setEarnDialogOpen(false)}
          onSuccess={handleTransactionSuccess}
          userId={user.id}
        />
        <BurnPointsDialog
          open={burnDialogOpen}
          onClose={() => setBurnDialogOpen(false)}
          onSuccess={handleTransactionSuccess}
          userId={user.id}
          currentBalance={wallet?.balance || 0}
        />
      </Container>
    </>
  );
}

