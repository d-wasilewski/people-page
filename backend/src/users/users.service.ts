import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getAllTeams() {
    const teams = await this.prisma.team.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return teams.map((team) => ({
      id: team.id,
      name: team.name,
    }));
  }

  async getAllMembers(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const users = await this.prisma.user.findMany({
      where: {
        memberships: {
          some: {},
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        lastLoginAt: true,
        memberships: {
          select: {
            role: true,
            isGuest: true,
          },
        },
        teamLinks: {
          include: {
            team: true,
          },
        },
      },
      skip,
      take: limit,
    });

    const total = await this.prisma.user.count({
      where: {
        memberships: {
          some: {},
        },
      },
    });

    return {
      data: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        lastLoginAt: user.lastLoginAt,
        role: user.memberships[0]?.role || null,
        teams: user.teamLinks.map((link) => link.team.name),
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        memberships: true,
        teamLinks: {
          include: {
            team: true,
          },
        },
      },
    });
  }

  async filterUsers({
    roles,
    isGuest,
    teams,
    search,
    lastLoginPeriod,
    page = 1,
    limit = 10,
    sortBy = 'name',
    order = 'asc',
  }: {
    roles?: string[];
    isGuest?: boolean;
    teams?: string[];
    search?: string;
    lastLoginPeriod?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }) {
    const skip = (page - 1) * limit;

    const where: any = {
      memberships: {
        some: {},
      },
    };

    if (roles && roles.filter(Boolean).length > 0) {
      where.memberships.some.role = {
        in: roles,
      };
    }

    if (isGuest) {
      where.memberships.some.isGuest = isGuest;
    }

    if (teams && teams.filter(Boolean).length > 0) {
      const hasNoTeamFilter = teams.includes('_NO_TEAM_');
      const regularTeams = teams.filter((team) => team !== '_NO_TEAM_');

      if (hasNoTeamFilter && regularTeams.length > 0) {
        where.OR = [
          {
            teamLinks: {
              none: {},
            },
          },
          {
            teamLinks: {
              some: {
                team: {
                  name: {
                    in: regularTeams,
                  },
                },
              },
            },
          },
        ];
      } else if (hasNoTeamFilter) {
        where.teamLinks = {
          none: {},
        };
      } else if (regularTeams.length > 0) {
        where.teamLinks = {
          some: {
            team: {
              name: {
                in: regularTeams,
              },
            },
          },
        };
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (lastLoginPeriod) {
      const now = new Date();

      if (lastLoginPeriod === '24h') {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        where.lastLoginAt = { gte: yesterday };
      } else if (lastLoginPeriod === '7d') {
        const lastWeek = new Date(now);
        lastWeek.setDate(now.getDate() - 7);
        where.lastLoginAt = { gte: lastWeek };
      } else if (lastLoginPeriod === '30d') {
        const lastMonth = new Date(now);
        lastMonth.setDate(now.getDate() - 30);
        where.lastLoginAt = { gte: lastMonth };
      } else if (lastLoginPeriod === 'never') {
        where.lastLoginAt = null;
      }
    }

    let dbOrderBy = {};
    if (
      ['name', 'email', 'lastLoginAt', 'createdAt', 'updatedAt'].includes(
        sortBy
      )
    ) {
      dbOrderBy = { [sortBy]: order };
    }

    const users = await this.prisma.user.findMany({
      where,
      orderBy: dbOrderBy,
      skip,
      take: limit,
      include: {
        memberships: true,
        teamLinks: {
          include: {
            team: true,
          },
        },
      },
    });

    const total = await this.prisma.user.count({ where });

    const rolePriority = {
      OWNER: 1,
      MEMBER: 2,
      VIEWER: 3,
    };

    const getHighestPriorityRole = (memberships) => {
      if (!memberships || memberships.length === 0) return null;

      return memberships
        .map((m) => m.role)
        .reduce((highest, current) => {
          if (!current) return highest;
          if (!highest) return current;
          return rolePriority[current] < rolePriority[highest]
            ? current
            : highest;
        }, null);
    };

    let mappedUsers = users.map((user) => {
      const highestRole = getHighestPriorityRole(user.memberships);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        lastLoginAt: user.lastLoginAt,
        role: highestRole,
        isGuest: user.memberships.some((m) => m.isGuest),
        teams: user.teamLinks.map((link) => link.team.name),
      };
    });

    if (sortBy === 'role') {
      mappedUsers = mappedUsers.sort((a, b) => {
        const roleA = a.role || '';
        const roleB = b.role || '';
        return order === 'asc'
          ? roleA.localeCompare(roleB)
          : roleB.localeCompare(roleA);
      });
    }

    return {
      data: mappedUsers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
