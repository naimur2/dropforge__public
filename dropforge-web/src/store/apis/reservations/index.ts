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
