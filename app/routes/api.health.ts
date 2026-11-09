import type { LoaderFunctionArgs } from 'react-router';

export const loader = async ({ request: _request }: LoaderFunctionArgs) => {
  return Response.json({
    status: 'healthy',
    buildMarker: 'deploy-check-454819d',
    timestamp: new Date().toISOString(),
  });
};
