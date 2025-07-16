import { ApiResponse, ApiSuccessResponse } from '@/types/api';

import { ApiErrorResponse, Result, err, ok } from './error';
import { wrapThrowsAsync } from './utils';

export const makeRequest = async <T>(
    appUrl: string,
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    data?: unknown,
    isDebug = false
): Promise<Result<T, ApiErrorResponse>> => {
    const url = new URL(appUrl + endpoint);
    const body = data ? JSON.stringify(data) : undefined;
    const res = await wrapThrowsAsync(fetch)(url.toString(), {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(isDebug && { 'Cache-Control': 'no-cache' })
        },
        body
    });

    if (!res.ok) {
        return err({
            code: 'network_error',
            status: 500,
            message: 'Something went wrong'
        });
    }

    const response = res.data;
    const json = (await response.json()) as ApiResponse;

    if (!response.ok) {
        const errorResponse = json as ApiErrorResponse;

        return err({
            code: errorResponse.code === 'forbidden' ? 'forbidden' : 'network_error',
            status: response.status,
            message: errorResponse.message || 'Something went wrong',
            url,
            ...(Object.keys(errorResponse.details ?? {}).length > 0 && { details: errorResponse.details })
        });
    }

    const successResponse = json as ApiSuccessResponse<T>;

    return ok(successResponse.data);
};
