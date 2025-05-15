import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { filterMembers } from '../services/api';
import PeopleTable from '../components/PeopleTable';
import FilterPanel from '../components/FilterPanel';
import { Box, Typography, CircularProgress, Alert, Stack } from '@mui/joy';

export type Order = 'asc' | 'desc';

const PeoplePage = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState({
    roles: [],
    isGuest: false,
    teams: [],
    search: '',
    lastLoginPeriod: '',
  });
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<string>('name');

  const handleFilterChange = useCallback((newFilters: any) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const queryKey = [
    'members',
    page,
    limit,
    filters.roles,
    filters.isGuest,
    filters.teams,
    filters.search,
    filters.lastLoginPeriod,
    orderBy,
    order,
  ];

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => filterMembers(page, limit, filters, orderBy, order),
    refetchOnWindowFocus: false,
  });

  const handlePageChange = (
    _: React.ChangeEvent<unknown> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (rowsPerPage: number) => {
    setLimit(rowsPerPage);
    setPage(1);
  };

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto' }}>
      <Typography level="h2" sx={{ mb: 3 }}>
        People
      </Typography>

      <FilterPanel onFilterChange={handleFilterChange} filters={filters} />

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert color="danger" sx={{ mt: 2 }}>
          Error loading members: {(error as Error).message}
        </Alert>
      ) : data ? (
        <Stack spacing={2}>
          <PeopleTable
            members={data.data}
            pagination={{
              page,
              count: data.pagination.pages,
              rowsPerPage: limit,
              onPageChange: handlePageChange,
              onRowsPerPageChange: handleRowsPerPageChange,
            }}
            sorting={{
              order,
              orderBy,
              onRequestSort: handleRequestSort,
            }}
          />
        </Stack>
      ) : null}
    </Box>
  );
};

export default PeoplePage;
