import { apiSlice } from '../index';
import type { 
  LoginDto, 
  RegisterDto, 
  AuthResponseDto,
  UserDto,
} from '@shared/dto';
import type { ApiResponse } from '@shared/types';
import { setCredentials, logout } from '../../features/auth.slice';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponseDto, LoginDto>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: ApiResponse<AuthResponseDto>) => response.data,
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch (err) {
          // Handled by UI
        }
      },
    }),
    register: builder.mutation<AuthResponseDto, RegisterDto>({
      query: (credentials) => ({
        url: '/auth/register',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: ApiResponse<AuthResponseDto>) => response.data,
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch (err) {
          // Handled by UI
        }
      },
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logout());
        } catch (err) {
          dispatch(logout());
        }
      },
    }),
    me: builder.query<UserDto, void>({
      query: () => '/auth/me',
      transformResponse: (response: ApiResponse<UserDto>) => response.data,
      providesTags: ['Auth'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials({ user: data }));
        } catch (err) {
          dispatch(logout());
        }
      },
    }),
  }),
});

export const { 
  useLoginMutation, 
  useRegisterMutation, 
  useLogoutMutation,
  useMeQuery, 
  useLazyMeQuery 
} = authApi;
