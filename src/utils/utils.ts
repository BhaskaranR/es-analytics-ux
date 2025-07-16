import { Result } from './error';

// Helper function to make all properties of a Zod object schema optional
const makeSchemaOptional = <T extends z.ZodRawShape>(schema: z.ZodObject<T>) => {
    return schema.extend(
        Object.fromEntries(Object.entries(schema.shape).map(([key, value]) => [key, value.optional()])) as {
            [K in keyof T]: z.ZodOptional<T[K]>;
        }
    );
};

export const wrapThrowsAsync =
    <T, A extends unknown[]>(fn: (...args: A) => Promise<T>) =>
    async (...args: A): Promise<Result<T>> => {
        try {
            return {
                ok: true,
                data: await fn(...args)
            };
        } catch (error) {
            return {
                ok: false,
                error: error as Error
            };
        }
    };
