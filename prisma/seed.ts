import { PrismaClient } from '../src/generated/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const TOTAL_USERS_WITH_MEMBERSHIP = 500;
const ADDITIONAL_USERS_WITHOUT_MEMBERSHIP = 200;
const TOTAL_USERS = TOTAL_USERS_WITH_MEMBERSHIP + ADDITIONAL_USERS_WITHOUT_MEMBERSHIP;
const TOTAL_TEAMS = 30;
const MAX_OWNERS = 20;
const MEMBERS_COUNT = 450;
const GUEST_PERCENTAGE = 10;

const ROLES = {
  OWNER: 'OWNER',
  MEMBER: 'MEMBER',
  VIEWER: 'VIEWER',
  BILLING: 'BILLING',
};

const TEAM_NAMES = [
  'Engineering', 'Frontend', 'Backend', 'DevOps', 'QA', 'Design', 'UX',
  'Product', 'Marketing', 'Sales', 'Finance', 'HR', 'Legal', 'Support',
  'Content', 'Data Science', 'Analytics', 'Infrastructure', 'Security',
  'Mobile', 'Platform', 'API', 'Integrations', 'Operations', 'Research',
  'Tigers', 'Eagles', 'Wolves', 'Bears', 'Sharks'
];

function createUserData(isCompanyMember = true) {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const domain = isCompanyMember ? 'acme.inc' : 'coyote.wile';
  return {
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
    name: `${firstName} ${lastName}`,
    lastLoginAt: faker.date.between({ 
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date() 
    }),
  };
}

async function main() {
  console.log('Seeding database...');
  
  await prisma.teamUser.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();
  
  console.log('Creating teams...');
  const teams: any[] = [];
  
  const shuffledTeamNames = faker.helpers.shuffle([...TEAM_NAMES]);
  
  for (let i = 0; i < TOTAL_TEAMS; i++) {
    const team = await prisma.team.create({
      data: {
        name: shuffledTeamNames[i] + (i >= TEAM_NAMES.length ? ` ${i - TEAM_NAMES.length + 1}` : ''),
      },
    });
    teams.push(team);
  }
  console.log(`Created ${teams.length} teams`);
  
  console.log('Creating users with memberships and team relationships...');
  const users: any[] = [];
  
  const ownerCount = Math.min(MAX_OWNERS, Math.floor(TOTAL_USERS_WITH_MEMBERSHIP * 0.04));
  for (let i = 0; i < ownerCount; i++) {
    const user = await prisma.user.create({
      data: {
        ...createUserData(true),
        memberships: {
          create: {
            role: ROLES.OWNER,
            isGuest: false,
          },
        },
        teamLinks: {
          create: faker.helpers.arrayElements(
            teams.map(team => ({ teamId: team.id })),
            faker.number.int({ min: 1, max: 5 })
          ),
        },
      },
    });
    users.push(user);
  }
  console.log(`Created ${ownerCount} owners`);
  
  for (let i = 0; i < MEMBERS_COUNT - ownerCount; i++) {
    const user = await prisma.user.create({
      data: {
        ...createUserData(true),
        memberships: {
          create: {
            role: ROLES.MEMBER,
            isGuest: false,
          },
        },
        teamLinks: {
          create: faker.helpers.arrayElements(
            teams.map(team => ({ teamId: team.id })),
            faker.number.int({ min: 0, max: 3 })
          ),
        },
      },
    });
    users.push(user);
  }
  console.log(`Created ${MEMBERS_COUNT - ownerCount} members`);
  
  const remainingUsers = TOTAL_USERS_WITH_MEMBERSHIP - MEMBERS_COUNT;
  
  const guestCount = Math.floor(remainingUsers * (GUEST_PERCENTAGE / 100));
  const viewerCount = remainingUsers - guestCount;
  
  for (let i = 0; i < viewerCount; i++) {
    const role = i < Math.floor(viewerCount * 0.05) ? ROLES.BILLING : ROLES.VIEWER;
    
    const user = await prisma.user.create({
      data: {
        ...createUserData(true),
        memberships: {
          create: {
            role,
            isGuest: false,
          },
        },
        teamLinks: {
          create: faker.helpers.arrayElements(
            teams.map(team => ({ teamId: team.id })),
            faker.number.int({ min: 0, max: 1 })
          ),
        },
      },
    });
    users.push(user);
  }
  console.log(`Created ${viewerCount} viewers`);
  
  for (let i = 0; i < guestCount; i++) {
    const user = await prisma.user.create({
      data: {
        ...createUserData(true),
        memberships: {
          create: {
            role: ROLES.VIEWER,
            isGuest: true,
          },
        },
        teamLinks: {
          create: faker.helpers.maybe(
            () => [{ teamId: faker.helpers.arrayElement(teams).id }],
            { probability: 0.7 }
          ),
        },
      },
    });
    users.push(user);
  }
  console.log(`Created ${guestCount} guests`);
  
  console.log(`Created ${users.length} users with memberships across ${teams.length} teams`);
  
  console.log('Creating additional users without memberships...');
  for (let i = 0; i < ADDITIONAL_USERS_WITHOUT_MEMBERSHIP; i++) {
    const user = await prisma.user.create({
      data: {
        ...createUserData(false),
        teamLinks: {
          create: faker.helpers.maybe(
            () => [{ teamId: faker.helpers.arrayElement(teams).id }],
            { probability: 0.3 }
          ),
        },
      },
    });
    users.push(user);
  }
  
  console.log(`Created ${ADDITIONAL_USERS_WITHOUT_MEMBERSHIP} additional users without memberships`);
  console.log('Database seeded successfully!');
  console.log(`Total: ${users.length} users (${TOTAL_USERS_WITH_MEMBERSHIP} with memberships, ${ADDITIONAL_USERS_WITHOUT_MEMBERSHIP} without)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 