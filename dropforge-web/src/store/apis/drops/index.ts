import { apiSlice } from '../index';
import type { 
  DropDto, 
  CreateDropDto,
} from '@shared/dto';
import type { ApiResponse } from '@shared/types';

export interface GetDropsArgs {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const dropsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDrops: builder.query<{ data: DropDto[], meta?: any }, GetDropsArgs | void>({
      query: (args) => {
        const params = new URLSearchParams();
        if (args?.page) params.append('page', args.page.toString());
        if (args?.limit) params.append('limit', args.limit.toString());
        if (args?.search) params.append('search', args.search);
        if (args?.status && args.status !== 'all') params.append('status', args.status);
        const queryStr = params.toString();
        return queryStr ? `/drops?${queryStr}` : '/drops';
      },
      transformResponse: (response: ApiResponse<DropDto[]>) => ({
        data: response.data,
        meta: response.meta,
      }),
      providesTags: (result) => 
        result?.data 
          ? [
              ...result.data.map(({ id }) => ({ type: 'Drop' as const, id })),
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
