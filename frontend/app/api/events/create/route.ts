import { proxyRequest } from '../../_proxy';

export async function POST(request: Request) {
  return proxyRequest(request, '/api/events/create');
}