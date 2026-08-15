import { NextResponse } from 'next/server';

type NearbyKind = 'Shelter' | 'Hospital' | 'Police' | 'Fire' | 'Relief camp';

function validCoordinate(value: unknown, limit: number) {
  return typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= limit;
}

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const radians = (value: number) => (value * Math.PI) / 180;
  const deltaLat = radians(lat2 - lat1);
  const deltaLon = radians(lon2 - lon1);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(deltaLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || !validCoordinate(body.latitude, 90) || !validCoordinate(body.longitude, 180)) {
    return NextResponse.json(
      { error: 'Valid latitude and longitude are required.' },
      { status: 400 }
    );
  }

  const latitude = body.latitude as number;
  const longitude = body.longitude as number;
  const query = `[out:json][timeout:12];(
    nwr["amenity"="hospital"](around:8000,${latitude},${longitude});
    nwr["amenity"="police"](around:8000,${latitude},${longitude});
    nwr["amenity"="fire_station"](around:8000,${latitude},${longitude});
    nwr["amenity"="shelter"](around:8000,${latitude},${longitude});
    nwr["social_facility"="shelter"](around:8000,${latitude},${longitude});
  );out center 30;`;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: new URLSearchParams({ data: query }).toString(),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'User-Agent': 'AapdaMitra/1.0 (nearby-help; https://aapdamitra.local)',
        Referer: 'http://localhost:3000/',
      },
      next: { revalidate: 300 },
    });
    if (!response.ok) throw new Error(`OpenStreetMap request failed (${response.status})`);
    const data = (await response.json()) as { elements?: Array<Record<string, unknown>> };
    const places = (data.elements ?? [])
      .map((element) => {
        const tags = (element.tags ?? {}) as Record<string, string>;
        const elementLatitude = Number(element.lat ?? (element.center as { lat?: number })?.lat);
        const elementLongitude = Number(element.lon ?? (element.center as { lon?: number })?.lon);
        if (!Number.isFinite(elementLatitude) || !Number.isFinite(elementLongitude)) return null;
        let kind: NearbyKind = 'Relief camp';
        if (tags.amenity === 'hospital') kind = 'Hospital';
        if (tags.amenity === 'police') kind = 'Police';
        if (tags.amenity === 'fire_station') kind = 'Fire';
        if (tags.amenity === 'shelter') kind = 'Shelter';
        return {
          id: `${element.type}-${element.id}`,
          name: tags.name || `${kind} (OpenStreetMap listing)`,
          kind,
          latitude: elementLatitude,
          longitude: elementLongitude,
          distanceKm: Number(
            distanceKm(latitude, longitude, elementLatitude, elementLongitude).toFixed(1)
          ),
        };
      })
      .filter((place): place is NonNullable<typeof place> => place !== null)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 12);

    return NextResponse.json({
      source: 'OpenStreetMap / Overpass',
      fetchedAt: new Date().toISOString(),
      places,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Nearby help service is unavailable.' },
      { status: 503 }
    );
  }
}
