import axios from 'axios';
import { Order } from '../pages/PeoplePage';

const API_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
});

export interface Member {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  isGuest: boolean;
  lastLoginAt: string | null;
  teams: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface Team {
  id: string;
  name: string;
}

export const getMembers = async (
  page: number = 1,
  limit: number = 10,
  filters: {
    role?: string;
    isGuest?: boolean;
    team?: string;
    search?: string;
  } = {}
): Promise<PaginatedResponse<Member>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, value.toString());
    }
  });

  const response = await api.get(`/users/members?${params.toString()}`);
  return response.data;
};

export const getTeams = async (): Promise<Team[]> => {
  const response = await api.get('/users/teams');
  return response.data;
};

export const filterMembers = async (
  page: number = 1,
  limit: number = 10,
  filters: {
    role?: string;
    isGuest?: boolean;
    teams?: string[];
    search?: string;
    lastLoginPeriod?: string;
  } = {},
  sortBy: string = 'name',
  order: Order = 'asc'
): Promise<PaginatedResponse<Member>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
    order,
  });

  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value) && value.length > 0) {
      params.append(key, value.join(','));
    } else if (value !== undefined && value !== '' && value !== null) {
      params.append(key, value.toString());
    }
  });

  console.log('Making API request with params:', params.toString());
  const response = await api.get(`/users/filter?${params.toString()}`);
  return response.data;
};

export default api;
