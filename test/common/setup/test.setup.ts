import { TestAppFixture } from '../fixtures';
import { cleanTestDatabase } from '../utils';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock('@app/common/guards/auth.guard.ts', () => ({
  AuthGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
}));

jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    incr: jest.fn(),
    reset: jest.fn(),
  })),
}));

beforeAll(async () => {
  await TestAppFixture.getApp();
});

beforeEach(async () => {
  await cleanTestDatabase();
});

afterAll(async () => {
  await TestAppFixture.close();
});
