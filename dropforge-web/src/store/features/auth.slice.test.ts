import { describe, it, expect } from 'vitest';
import authReducer, { setCredentials, logout, setUser } from './auth.slice';
import type { UserDto } from '@/shared/dto';

describe('Auth Slice', () => {
  const initialState = {
    user: null,
    isAuthenticated: false,
  };

  const mockUser: UserDto = {
    id: 'user-1',
    username: 'testuser',
    email: 'test@example.com',
    createdAt: '2026-06-18T00:00:00.000Z',
  };

  it('should handle initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setCredentials', () => {
    const actual = authReducer(initialState, setCredentials({ user: mockUser }));
    expect(actual.isAuthenticated).toBe(true);
    expect(actual.user).toEqual(mockUser);
  });

  it('should handle logout', () => {
    const loggedInState = {
      user: mockUser,
      isAuthenticated: true,
    };
    const actual = authReducer(loggedInState, logout());
    expect(actual.isAuthenticated).toBe(false);
    expect(actual.user).toBeNull();
  });

  it('should handle setUser', () => {
    const actual = authReducer(initialState, setUser(mockUser));
    expect(actual.user).toEqual(mockUser);
    // setUser does not modify isAuthenticated unless explicitly tied, but in this slice it does
    expect(actual.isAuthenticated).toBe(true);
  });
});
