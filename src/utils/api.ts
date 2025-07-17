import { ApiResponse, ApiSuccessResponse } from '../types/api';
import { ApiErrorResponse, Result, err, ok } from './error';
import { wrapThrowsAsync } from './utils';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Define the missing types
interface CreateOrUpdateUserResponse {
    userId: string;
    attributes?: Record<string, string>;
}

interface TEnvironmentState {
    environmentId: string;
    // Add other properties as needed based on your API response
}

// Create axios instance with interceptors
const createAxiosInstance = (authToken?: string): AxiosInstance => {
    const instance = axios.create();

    // Request interceptor to add authorization header
    instance.interceptors.request.use(
        (config: any) => {
            if (authToken) {
                config.headers.Authorization = `Bearer ${authToken}`;
            }

            return config;
        },
        (error: any) => {
            return Promise.reject(error);
        }
    );

    return instance;
};

interface RequestOptions {
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: unknown;
    isDebug?: boolean;
    authToken?: string;
    appUrl?: string;
}

/**
 * Usage examples:
 *
 * // Simple GET request
 * const result = await makeRequest<User[]>({
 *   endpoint: '/api/users',
 *   method: 'GET'
 * });
 *
 * // POST with data
 * const result = await makeRequest<Comment>({
 *   endpoint: '/api/comments',
 *   method: 'POST',
 *   data: { text: 'Hello world' }
 * });
 *
 * // With auth token
 * const result = await makeRequest<User>({
 *   endpoint: '/api/profile',
 *   method: 'GET',
 *   authToken: 'your-jwt-token'
 * });
 *
 * // With custom URL
 * const result = await makeRequest<User[]>({
 *   endpoint: '/api/users',
 *   method: 'GET',
 *   appUrl: 'https://api.example.com'
 * });
 *
 * // With debug mode
 * const result = await makeRequest<User[]>({
 *   endpoint: '/api/users',
 *   method: 'GET',
 *   isDebug: true
 * });
 *
 * // In useEffect
 * useEffect(() => {
 *   const fetchUsers = async () => {
 *     const result = await makeRequest<User[]>({
 *       endpoint: '/api/users',
 *       method: 'GET',
 *       authToken: 'your-token'
 *     });
 *
 *     if (result.ok) {
 *       setUsers(result.data);
 *     } else {
 *       console.error('Error:', result.error);
 *     }
 *   };
 *
 *   fetchUsers();
 * }, []);
 */

export const makeRequest = async <T>(options: RequestOptions): Promise<Result<T, ApiErrorResponse>> => {
    const { endpoint, method, data, isDebug = false, authToken, appUrl } = options;
    const baseUrl = appUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const url = new URL(endpoint, baseUrl);
    const axiosInstance = createAxiosInstance(authToken);

    const config: AxiosRequestConfig = {
        method,
        url: url.toString(),
        headers: {
            'Content-Type': 'application/json',
            ...(isDebug && { 'Cache-Control': 'no-cache' })
        },
        ...(data ? { data } : {})
    };

    const res = await wrapThrowsAsync(axiosInstance)(config);

    if (!res.ok) {
        return err({
            code: 'network_error',
            status: 500,
            message: 'Something went wrong'
        });
    }

    const response: AxiosResponse = res.data;
    const json = response.data as ApiResponse;

    if (response.status >= 400) {
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
