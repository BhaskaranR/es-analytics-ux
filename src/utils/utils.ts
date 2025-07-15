// Helper function to make all properties of a Zod object schema optional
const makeSchemaOptional = <T extends z.ZodRawShape>(schema: z.ZodObject<T>) => {
    return schema.extend(
        Object.fromEntries(Object.entries(schema.shape).map(([key, value]) => [key, value.optional()])) as {
            [K in keyof T]: z.ZodOptional<T[K]>;
        }
    );
};
