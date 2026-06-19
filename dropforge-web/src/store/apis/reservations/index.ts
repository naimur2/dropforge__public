import { apiSlice } from '../index';
import type { 
  ReservationDto, 
  CreateReservationDto,
} from '@shared/dto';
import type { ApiResponse } from '@shared/types';

export const reservationsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyReservations: builder.query<ReservationDto[], void>({
      query: () => '/reservations/me',
      transformResponse: (response: ApiResponse<ReservationDto[]>) => response.data,
      providesTags: (result) => 
        result 
          ? [
              ...result.map(({ id }) => ({ type: 'Reservation' as const, id })),
              { type: 'Reservation', id: 'LIST' },
            ]
          : [{ type: 'Reservation', id: 'LIST' }],
      async onCacheEntryAdded(_arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
        try {
          await cacheDataLoaded;
          const { globalSocket } = await import('@/providers/SocketProvider');
          if (!globalSocket) return;

          const onExpired = (data: any) => {
            updateCachedData((draft) => {
              const index = draft.findIndex((r) => r.id === data.reservationId);
              if (index !== -1) {
                draft.splice(index, 1);
              }
            });
          };

          globalSocket.on('reservation.expired', onExpired);
          await cacheEntryRemoved;
          globalSocket.off('reservation.expired', onExpired);
        } catch {}
      },
    }),
    createReservation: builder.mutation<ReservationDto, CreateReservationDto>({
      query: (reservationData) => ({
        url: '/reservations',
        method: 'POST',
        body: reservationData,
      }),
      transformResponse: (response: ApiResponse<ReservationDto>) => response.data,
      invalidatesTags: [
        { type: 'Reservation', id: 'LIST' },
        { type: 'Drop', id: 'LIST' }
      ],
    }),
  }),
});

export const { useGetMyReservationsQuery, useCreateReservationMutation } = reservationsApi;
