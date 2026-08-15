import { NextResponse } from 'next/server';

const allowedIncidents = new Set([
  'Flood',
  'Earthquake',
  'Fire',
  'Cyclone',
  'Landslide',
  'Heatwave',
  'Lightning',
  'Tsunami',
  'Medical Emergency',
  'Other',
]);

function validCoordinate(value: unknown, limit: number) {
  return typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= limit;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.incidentType !== 'string' || !allowedIncidents.has(body.incidentType)) {
    return NextResponse.json({ error: 'A valid incident type is required.' }, { status: 400 });
  }
  if (
    body.latitude !== undefined &&
    (!validCoordinate(body.latitude, 90) || !validCoordinate(body.longitude, 180))
  ) {
    return NextResponse.json({ error: 'Location coordinates are invalid.' }, { status: 400 });
  }

  const emergencyRequest = {
    id: `AM-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    incidentType: body.incidentType,
    severity: typeof body.severity === 'string' ? body.severity.slice(0, 24) : 'Unverified',
    location:
      body.latitude === undefined ? null : { latitude: body.latitude, longitude: body.longitude },
    createdAt: new Date().toISOString(),
  };
  const webhookUrl = process.env.EMERGENCY_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json({
      request: emergencyRequest,
      dispatch: 'DEMO',
      message: 'No emergency dispatch service is configured.',
    });
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.EMERGENCY_WEBHOOK_TOKEN
          ? { Authorization: `Bearer ${process.env.EMERGENCY_WEBHOOK_TOKEN}` }
          : {}),
      },
      body: JSON.stringify(emergencyRequest),
    });
    if (!response.ok) throw new Error(`Dispatch integration returned ${response.status}`);
    return NextResponse.json({ request: emergencyRequest, dispatch: 'FORWARDED' });
  } catch (error) {
    return NextResponse.json(
      {
        request: emergencyRequest,
        dispatch: 'FAILED',
        error: error instanceof Error ? error.message : 'Dispatch integration failed.',
      },
      { status: 502 }
    );
  }
}
