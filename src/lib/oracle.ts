export interface OracleRequest {
    operation: string;
    params?: Record<string, any>;
}

export async function callOracle({ operation, params }: OracleRequest) {
    const response = await fetch('/api/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation, params })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Oracle API error');
    }

    const result = await response.json();

    if (!result.success) {
        throw new Error(result.error || 'Oracle operation failed');
    }

    return result.data;
}
