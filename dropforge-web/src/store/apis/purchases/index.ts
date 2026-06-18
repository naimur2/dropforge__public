import { apiSlice } from '../index';
import type { 
  PurchaseDto, 
  CreatePurchaseDto,
} from '@shared/dto';
import type { ApiResponse } from '@shared/types';

export const purchasesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createPurchase: builder.mutation<PurchaseDto, CreatePurchaseDto>({
      query: (purchaseData) => ({
        url: '/purchases',
        method: 'POST',
        body: purchaseData,
      }),
      transformResponse: (response: ApiResponse<PurchaseDto>) => response.data,
      // Invalidates reservations list since a reservation is now "PURCHASED"
      invalidatesTags: [{ type: 'Reservation', id: 'LIST' }],
    }),
  }),
});

export const { useCreatePurchaseMutation } = purchasesApi;
