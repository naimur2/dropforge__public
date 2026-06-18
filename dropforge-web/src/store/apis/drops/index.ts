import { apiSlice } from '../index';
import type { 
  DropDto, 
  CreateDropDto,
  UpdateDropDto,
} from '@shared/dto';
import type { ApiResponse } from '@shared/types';
import { globalSocket } from '@/providers/SocketProvider';
import { SOCKET_EVENTS } from '@/shared/events';

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
      async onCacheEntryAdded(
        _arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        try {
          await cacheDataLoaded;

          if (!globalSocket) return;

          const onStockUpdated = (data: any) => {
            updateCachedData((draft) => {
              const drop = draft.data.find((d) => d.id === data.dropId);
              if (drop) {
                drop.availableStock = data.availableStock;
              }
            });
          };

          const onPurchaseCompleted = (data: any) => {
            updateCachedData((draft) => {
              const drop = draft.data.find((d) => d.id === data.dropId);
              if (drop) {
                drop.latestPurchasers = data.latestPurchasers;
              }
            });
          };

          globalSocket.on(SOCKET_EVENTS.STOCK_UPDATED, onStockUpdated);
          globalSocket.on(SOCKET_EVENTS.PURCHASE_COMPLETED, onPurchaseCompleted);

          await cacheEntryRemoved;

          globalSocket.off(SOCKET_EVENTS.STOCK_UPDATED, onStockUpdated);
          globalSocket.off(SOCKET_EVENTS.PURCHASE_COMPLETED, onPurchaseCompleted);
        } catch {
          // no-op if cacheEntryRemoved resolves before loaded
        }
      },
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
    updateDrop: builder.mutation<DropDto, { id: string; data: UpdateDropDto }>({
      query: ({ id, data }) => ({
        url: `/drops/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response: ApiResponse<DropDto>) => response.data,
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Drop', id },
        { type: 'Drop', id: 'LIST' },
      ],
    }),
    deleteDrop: builder.mutation<void, string>({
      query: (id) => ({
        url: `/drops/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Drop', id: 'LIST' }],
    }),
  }),
});

export const { 
  useGetDropsQuery, 
  useGetDropByIdQuery, 
  useCreateDropMutation,
  useUpdateDropMutation,
  useDeleteDropMutation,
} = dropsApi;
