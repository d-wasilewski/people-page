import {
  Box,
  Card,
  Stack,
  Select,
  Option,
  Input,
  Checkbox,
  CircularProgress,
  Chip,
} from '@mui/joy';
import { z } from 'zod';
import { useState, useEffect, useCallback } from 'react';
import { getTeams } from '../services/api';
import { useQuery } from '@tanstack/react-query';
import { debounce } from '../utils/debounce';

const filterSchema = z.object({
  roles: z.array(z.string()).optional(),
  isGuest: z.boolean().optional(),
  teams: z.array(z.string()).optional(),
  search: z.string().optional(),
  lastLoginPeriod: z.string().optional(),
});

const FilterPanel = ({
  onFilterChange,
  filters = {
    roles: [],
    isGuest: false,
    teams: [],
    search: '',
    lastLoginPeriod: '',
  },
}: {
  onFilterChange: (filters: any) => void;
  filters: {
    roles?: string[];
    isGuest?: boolean;
    teams?: string[];
    search?: string;
    lastLoginPeriod?: string;
  };
}) => {
  const [searchValue, setSearchValue] = useState(filters.search || '');

  const rolesValue = Array.isArray(filters.roles) ? filters.roles : [];
  const teamsValue = Array.isArray(filters.teams) ? filters.teams : [];

  const { data: teams, isLoading: loadingTeams } = useQuery({
    queryKey: ['teams'],
    queryFn: getTeams,
  });

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      handleFilterChange('search', value);
    }, 500),
    []
  );

  useEffect(() => {
    setSearchValue(filters.search || '');
  }, [filters.search]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);
    debouncedSearch(value);
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };

    const parsedFilters = filterSchema.safeParse(newFilters);
    if (parsedFilters.success) {
      console.log('Calling onFilterChange with:', parsedFilters.data);
      onFilterChange(parsedFilters.data);
    }
  };

  return (
    <Card variant="outlined" sx={{ mb: 2, p: 2 }}>
      <Stack
        direction="row"
        alignContent="center"
        spacing={2}
        sx={{ flexWrap: 'wrap', gap: 2 }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ flexWrap: 'wrap', gap: 2, flexGrow: 1 }}
        >
          <Box>
            <Select
              placeholder="Roles"
              multiple
              value={rolesValue}
              onChange={(_, newValue) => handleFilterChange('roles', newValue)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {selected.map((role) => (
                    <Chip
                      key={role.id}
                      size="sm"
                      variant="soft"
                      color="primary"
                    >
                      {role.label}
                    </Chip>
                  ))}
                </Box>
              )}
              sx={{ maxWidth: 180 }}
              slotProps={{
                listbox: {
                  sx: { width: 140 },
                },
              }}
            >
              <Option value="OWNER">Owner</Option>
              <Option value="MEMBER">Member</Option>
              <Option value="VIEWER">Viewer</Option>
            </Select>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Checkbox
              label="Guest"
              checked={filters.isGuest}
              onChange={(event) =>
                handleFilterChange('isGuest', event.target.checked)
              }
            />
          </Box>
          <Box>
            <Select
              placeholder="Last Login"
              value={filters.lastLoginPeriod}
              onChange={(_, newValue) =>
                handleFilterChange('lastLoginPeriod', newValue)
              }
            >
              <Option value="">Any time</Option>
              <Option value="24h">Last 24 hours</Option>
              <Option value="7d">Last 7 days</Option>
              <Option value="30d">Last 30 days</Option>
              <Option value="never">Never logged in</Option>
            </Select>
          </Box>
          <Box>
            <Select
              placeholder="Teams"
              multiple
              value={teamsValue}
              onChange={(_, newValue) => handleFilterChange('teams', newValue)}
              startDecorator={
                loadingTeams ? <CircularProgress size="sm" /> : null
              }
              disabled={loadingTeams}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {selected.map((teamName) => (
                    <Chip
                      key={teamName.id}
                      size="sm"
                      variant="soft"
                      color="primary"
                    >
                      {teamName.label === '_NO_TEAM_'
                        ? 'No Team'
                        : teamName.label}
                    </Chip>
                  ))}
                </Box>
              )}
              sx={{ maxWidth: 240 }}
              slotProps={{
                listbox: {
                  sx: { width: 240 },
                },
              }}
            >
              <Option value="_NO_TEAM_">No Team</Option>

              {teams?.map((team) => (
                <Option key={team.id} value={team.name}>
                  {team.name}
                </Option>
              ))}
            </Select>
          </Box>
        </Stack>
        <Box sx={{ width: 300 }}>
          <Input
            placeholder="Search by name or email"
            value={searchValue}
            onChange={handleSearchChange}
            fullWidth
          />
        </Box>
      </Stack>
    </Card>
  );
};

export default FilterPanel;
