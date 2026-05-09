export function getBackendBaseUrl() {
  return process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
}

export async function proxyRequest(request: Request, targetPath: string) {
  const backendUrl = new URL(targetPath, getBackendBaseUrl());
  const headers = new Headers(request.headers);
  headers.delete('host');

  const response = await fetch(backendUrl, {
    method: request.method,
    headers,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.arrayBuffer(),
    redirect: 'manual',
  });

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  });
}