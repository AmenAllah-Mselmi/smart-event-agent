import { proxyRequest } from '../../../_proxy';

export async function GET(request: Request, { params }: { params: { event_id: string } }) {
  return proxyRequest(request, `/api/events/${params.event_id}/plan`);
}