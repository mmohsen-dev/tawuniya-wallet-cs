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
  Pagination,
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

interface PaginationData {
  total: number;
  limit: number;
  offset: number;
}

export default function TransactionHistory({ userId, refreshTrigger }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const limit = 10;

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const offset = (page - 1) * limit;
      const response = await transactionAPI.getTransactions(userId, undefined, limit, offset);
      setTransactions(response.data.transactions);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, page, limit]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions, refreshTrigger]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

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

  if (transactions.length === 0) {
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
      
      {pagination && pagination.total > limit && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(pagination.total / limit)}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </>
  );
}

