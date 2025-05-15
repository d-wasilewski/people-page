import { Member } from '../services/api';
import {
  Table,
  Sheet,
  Typography,
  Chip,
  Box,
  IconButton,
  Select,
  Option,
  Link,
} from '@mui/joy';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { visuallyHidden } from '@mui/utils';

type Order = 'asc' | 'desc';

interface SortConfig {
  order: Order;
  orderBy: string;
  onRequestSort: (property: string) => void;
}

interface PeopleTableProps {
  members: Member[];
  pagination: {
    page: number;
    count: number;
    rowsPerPage: number;
    onPageChange: (
      event: React.ChangeEvent<unknown> | null,
      page: number
    ) => void;
    onRowsPerPageChange: (rowsPerPage: number) => void;
  };
  sorting: SortConfig;
}

interface HeadCell {
  id: string;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  { id: 'name', label: 'Name', numeric: false },
  { id: 'email', label: 'Email', numeric: false },
  { id: 'role', label: 'Role', numeric: false },
  { id: 'isGuest', label: 'Guest', numeric: false },
  { id: 'lastLoginAt', label: 'Last Login', numeric: false },
  { id: 'teams', label: 'Teams', numeric: false },
];

const PeopleTable = ({ members, pagination, sorting }: PeopleTableProps) => {
  const { order, orderBy, onRequestSort } = sorting;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const createSortHandler = (property: string) => () => {
    onRequestSort(property);
  };

  return (
    <Sheet variant="outlined" sx={{ borderRadius: 'sm', overflow: 'auto' }}>
      <Table stickyHeader hoverRow>
        <thead>
          <tr>
            {headCells.map((headCell) => {
              const active = orderBy === headCell.id;
              return (
                <th
                  key={headCell.id}
                  aria-sort={
                    active
                      ? ({ asc: 'ascending', desc: 'descending' } as const)[
                          order
                        ]
                      : undefined
                  }
                >
                  <Link
                    underline="none"
                    color="neutral"
                    textColor={active ? 'primary.plainColor' : undefined}
                    component="button"
                    onClick={createSortHandler(headCell.id)}
                    endDecorator={
                      <ArrowDownwardIcon
                        sx={[active ? { opacity: 1 } : { opacity: 0 }]}
                      />
                    }
                    sx={{
                      fontWeight: 'lg',
                      display: 'inline-flex',
                      alignItems: 'center',
                      '& svg': {
                        transition: '0.2s',
                        transform:
                          active && order === 'desc'
                            ? 'rotate(0deg)'
                            : 'rotate(180deg)',
                      },
                      '&:hover': { '& svg': { opacity: 1 } },
                    }}
                  >
                    {headCell.label}
                    {active ? (
                      <Box component="span" sx={visuallyHidden}>
                        {order === 'desc'
                          ? 'sorted descending'
                          : 'sorted ascending'}
                      </Box>
                    ) : null}
                  </Link>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id}>
              <td>{member.name || 'No name'}</td>
              <td>{member.email}</td>
              <td>{member.role || 'None'}</td>
              <td>
                {member.isGuest ? (
                  <Chip size="sm" color="warning">
                    True
                  </Chip>
                ) : (
                  <Chip size="sm" color="primary">
                    False
                  </Chip>
                )}
              </td>
              <td>{formatDate(member.lastLoginAt)}</td>
              <td>
                {member.teams.length === 0 ? (
                  <Typography level="body-sm" color="neutral">
                    No teams
                  </Typography>
                ) : (
                  member.teams.map((team) => (
                    <Chip key={team} size="sm" sx={{ mr: 0.5, mb: 0.5 }}>
                      {team}
                    </Chip>
                  ))
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {pagination.count > 1 && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2,
            px: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography>Rows per page:</Typography>
            <Select
              value={pagination.rowsPerPage}
              onChange={(_, newValue) => {
                if (newValue) pagination.onRowsPerPageChange(Number(newValue));
              }}
              size="sm"
            >
              <Option value={5}>5</Option>
              <Option value={10}>10</Option>
              <Option value={25}>25</Option>
            </Select>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              size="sm"
              color="neutral"
              variant="outlined"
              disabled={pagination.page === 1}
              onClick={() => pagination.onPageChange(null, pagination.page - 1)}
            >
              <KeyboardArrowLeftIcon />
            </IconButton>
            <Typography>
              {pagination.page} of {pagination.count}
            </Typography>
            <IconButton
              size="sm"
              color="neutral"
              variant="outlined"
              disabled={pagination.page >= pagination.count}
              onClick={() => pagination.onPageChange(null, pagination.page + 1)}
            >
              <KeyboardArrowRightIcon />
            </IconButton>
          </Box>
        </Box>
      )}
    </Sheet>
  );
};

export default PeopleTable;
