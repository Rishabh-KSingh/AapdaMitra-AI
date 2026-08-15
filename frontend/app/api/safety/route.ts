import { NextResponse } from 'next/server';

function parseCoordinate(value: string | null, limit: number) {
  const number = Number(value);
  return Number.isFinite(number) && Math.abs(number) <= limit ? number : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latitude = parseCoordinate(searchParams.get('latitude'), 90);
  const longitude = parseCoordinate(searchParams.get('longitude'), 180);
  if (latitude === null || longitude === null) {
    return NextResponse.json(
      { error: 'Valid latitude and longitude are required.' },
      { status: 400 }
    );
  }

  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(latitude));
  url.searchParams.set('longitude', String(longitude));
  url.searchParams.set(
    'current',
    'temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_gusts_10m'
  );
  url.searchParams.set('timezone', 'auto');

  try {
    const response = await fetch(url, { next: { revalidate: 600 } });
    if (!response.ok) throw new Error(`Weather request failed (${response.status})`);
    const weather = (await response.json()) as { current?: Record<string, number | string> };
    const current = weather.current ?? {};
    const temperature = Number(current.temperature_2m ?? 0);
    const precipitation = Number(current.precipitation ?? 0);
    const gusts = Number(current.wind_gusts_10m ?? 0);
    const risks = [
      precipitation >= 5
        ? 'Heavy precipitation: avoid waterlogged routes and monitor local advisories.'
        : null,
      gusts >= 60
        ? 'Strong wind gusts: stay away from weak structures and falling branches.'
        : null,
      temperature >= 40
        ? 'High heat: reduce outdoor exertion, hydrate, and check on vulnerable people.'
        : null,
    ].filter(Boolean);
    return NextResponse.json({
      source: 'Open-Meteo',
      fetchedAt: new Date().toISOString(),
      current,
      risks,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Live weather service is unavailable.' },
      { status: 503 }
    );
  }
}
