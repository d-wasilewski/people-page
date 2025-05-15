import {
  Controller,
  Get,
  Query,
  Param,
  Req,
  ParseArrayPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('teams')
  async getTeams() {
    return this.usersService.getAllTeams();
  }

  @Get('filter')
  async filterUsers(
    @Req() request: Request,
    @Query(
      'roles',
      new ParseArrayPipe({ items: String, separator: ',', optional: true })
    )
    roles?: string[],
    @Query('isGuest')
    isGuest?: string,
    @Query(
      'teams',
      new ParseArrayPipe({ items: String, separator: ',', optional: true })
    )
    teams?: string[],
    @Query('search') search?: string,
    @Query('lastLoginPeriod') lastLoginPeriod?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('sortBy') sortBy = 'name',
    @Query('order') order: 'asc' | 'desc' = 'asc'
  ) {
    const isGuestParsed =
      isGuest === 'true' ? true : isGuest === 'false' ? false : undefined;

    return this.usersService.filterUsers({
      roles,
      isGuest: isGuestParsed,
      teams,
      search,
      lastLoginPeriod,
      page: +page,
      limit: +limit,
      sortBy,
      order,
    });
  }
}
