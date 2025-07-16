export type ApiResponse = ApiSuccessResponse | ApiErrorResponse;

export interface ApiSuccessResponse<T = Record<string, unknown>> {
    data: T;
}

export interface ApiErrorResponse {
    code:
        | 'not_found'
        | 'gone'
        | 'bad_request'
        | 'internal_server_error'
        | 'unauthorized'
        | 'method_not_allowed'
        | 'not_authenticated'
        | 'forbidden'
        | 'network_error'
        | 'too_many_requests';
    message: string;
    status: number;
    details?: Record<string, string | string[] | number | number[] | boolean | boolean[]>;
    responseMessage?: string;
}
