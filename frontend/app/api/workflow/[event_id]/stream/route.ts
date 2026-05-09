import { getBackendBaseUrl } from '../../../_proxy';

export async function GET(request: Request, { params }: { params: { event_id: string } }) {
  const backendUrl = new URL(`/api/workflow/${params.event_id}/stream`, getBackendBaseUrl());
  const backendResponse = await fetch(backendUrl, {
    headers: request.headers,
  });

  return new Response(backendResponse.body, {
    status: backendResponse.status,
    headers: backendResponse.headers,
  });
}