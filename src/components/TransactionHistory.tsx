'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { transactionAPI } from '@/lib/api';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  type: 'earn' | 'burn';
  amount: number;
  sarAmount?: number;
  description?: string;
  expired: boolean;
  createdAt: string;
  service?: {
    id: string;
    name: string;
    description?: string;
  };
}

interface TransactionHistoryProps {
  userId: string;
  refreshTrigger: number;
}

export default function TransactionHistory({ userId, refreshTrigger }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await transactionAPI.getTransactions(userId);
      
      // Handle new standardized response format: { success, message, data: { transactions } }
      // or fallback to old format: { transactions }
      const responseData = response.data;
      let transactionsData: Transaction[] = [];
      
      if (responseData.success && responseData.data) {
        // New standardized format
        transactionsData = responseData.data.transactions || [];
      } else if (responseData.transactions) {
        // Old format (backward compatibility)
        transactionsData = responseData.transactions || [];
      }
      
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setTransactions([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions, refreshTrigger]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography color="text.secondary">
          No transactions yet. Start earning or using points!
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Service</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Points</TableCell>
              <TableCell align="right">SAR Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                <TableCell>
                  <Chip
                    icon={
                      transaction.type === 'earn' ? (
                        <TrendingUpIcon />
                      ) : (
                        <TrendingDownIcon />
                      )
                    }
                    label={transaction.type.toUpperCase()}
                    color={transaction.type === 'earn' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {transaction.service?.name || 'N/A'}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {transaction.description || 'No description'}
                  </Typography>
                  {transaction.expired && (
                    <Chip label="EXPIRED" size="small" color="warning" sx={{ mt: 0.5 }} />
                  )}
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    sx={{
                      color: transaction.type === 'earn' ? 'success.main' : 'error.main',
                      fontWeight: 'bold',
                    }}
                  >
                    {transaction.type === 'earn' ? '+' : '-'}
                    {transaction.amount}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  {transaction.sarAmount ? `${transaction.sarAmount} SAR` : 'N/A'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

