export interface ElasticsearchRequest {
    endpoint: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
}

export async function callElasticsearch({ endpoint, method = 'POST', body }: ElasticsearchRequest) {
    const response = await fetch('/api/elasticsearch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint, method, body })
    });
    if (!response.ok) throw new Error('Elasticsearch proxy error');

    return response.json();
}
