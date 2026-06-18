import {
  createApi,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react';
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { Mutex } from 'async-mutex';

import { logout } from '../features/auth.slice';

const BASE_URL = '/api';
const refreshMutex = new Mutex();

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: 'include', // Automatically sends HttpOnly cookies (accessToken, refreshToken)
  prepareHeaders: (headers) => {
    headers.set('Accept', 'application/json');

    if (!headers.get('file') && !headers.get('content-type')) {
      headers.set('Content-Type', 'application/json');
    }

    return headers;
  },
});

const baseQueryWithReAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await refreshMutex.waitForUnlock();

  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && [401, 403].includes(Number(result.error.status))) {
    if (refreshMutex.isLocked()) {
      await refreshMutex.waitForUnlock();
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      const release = await refreshMutex.acquire();

      try {
        // Because refresh uses HttpOnly cookies, we just hit the endpoint
        const refreshResult = await rawBaseQuery(
          {
            url: '/auth/refresh',
            method: 'POST',
          },
          api,
          extraOptions,
        );

        if (refreshResult.data) {
          // Tokens were set successfully via HttpOnly Set-Cookie headers
          // Retry the original query
          result = await rawBaseQuery(args, api, extraOptions);
        } else {
          // Refresh failed (invalid/expired refresh token cookie)
          api.dispatch(logout());
        }
      } finally {
        release();
      }
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReAuth,
  tagTypes: [
    'Auth',
    'Drop',
    'Reservation',
    'Purchase',
  ],
  endpoints: () => ({}),
});
