import { apiSlice } from '../index';
import type { 
  DropDto, 
  CreateDropDto,
} from '@shared/dto';
import type { ApiResponse } from '@shared/types';

export const dropsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDrops: builder.query<DropDto[], void>({
      query: () => '/drops',
      transformResponse: (response: ApiResponse<DropDto[]>) => response.data,
      providesTags: (result) => 
        result 
          ? [
              ...result.map(({ id }) => ({ type: 'Drop' as const, id })),
              { type: 'Drop', id: 'LIST' },
            ]
          : [{ type: 'Drop', id: 'LIST' }],
    }),
    getDropById: builder.query<DropDto, string>({
      query: (id) => `/drops/${id}`,
      transformResponse: (response: ApiResponse<DropDto>) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Drop', id }],
    }),
    createDrop: builder.mutation<DropDto, CreateDropDto>({
      query: (dropData) => ({
        url: '/drops',
        method: 'POST',
        body: dropData,
      }),
      transformResponse: (response: ApiResponse<DropDto>) => response.data,
      invalidatesTags: [{ type: 'Drop', id: 'LIST' }],
    }),
  }),
});

export const { useGetDropsQuery, useGetDropByIdQuery, useCreateDropMutation } = dropsApi;
