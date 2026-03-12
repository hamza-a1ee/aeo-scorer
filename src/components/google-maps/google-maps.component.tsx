'use client';

import {
  GoogleMap,
  InfoWindow,
  Marker,
  useJsApiLoader,
} from '@react-google-maps/api';
import { useRef, useState } from 'react';
import MapPopup from './map-popup.component';
import { cn } from '@/lib/utils';
import {
  MAP_CONTAINER_STYLE,
  MAP_STYLES,
} from '@/constants/google-maps.constant';

const POPUP_OFFSET: Record<number, number> = {
  1: 25,
  2: 14,
  3: 8,
  4: 4,
  5: 2,
  6: 1,
  7: 0.5,
  8: 0.25,
  9: 0.125,
  10: 0.0625,
  11: 0.03125,
  12: 0.013,
  13: 0.009,
  14: 0.004,
  15: 0.0019,
  16: 0.0009,
  17: 0.0005,
  18: 0.00023,
  19: 0.00013,
  20: 0.00006,
  21: 0.00003,
  22: 0.000015,
};

export interface MapShop {
  id: string;
  name: string;
  address?: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  rating?: number;
  reviewCount?: number;
  primary_image?: string;
  shop_services?: { title: string }[];
}

const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 };

// Custom SVG marker: solid orange fill, white stroke ring, translucent orange outer glow (bg-primary/70)
const SHOP_MARKER_SVG = `<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="30" cy="30" r="29" fill="#FE6300" fill-opacity="0.3"/>
  <circle cx="30" cy="30" r="18" fill="#FE6300" stroke="white" stroke-width="5"/>
</svg>`;

const SHOP_MARKER_ICON = {
  url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(SHOP_MARKER_SVG)}`,
  scaledSize: {
    width: 60,
    height: 60,
    equals: () => false,
  } as google.maps.Size,
  anchor: { x: 30, y: 30, equals: () => false } as google.maps.Point,
};

interface Props {
  shops: MapShop[];
  className?: string;
  mapContainerStyle?: React.CSSProperties;
}

export default function GoogleMaps({
  shops,
  className,
  mapContainerStyle,
}: Props) {
  const [selectedShop, setSelectedShop] = useState<MapShop | null>(null);
  const [zoom, setZoom] = useState(12);
  const mapRef = useRef<google.maps.Map | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey ?? '',
  });

  const center = shops.length
    ? { lat: shops[0].lat, lng: shops[0].lng }
    : DEFAULT_CENTER;

  if (!apiKey) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded-xl bg-neutral-gray-10 text-sm text-test-secondary">
        Google Maps API key is not configured.
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded-xl bg-neutral-gray-10 text-sm text-test-secondary">
        Failed to load Google Maps.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-[320px] animate-pulse rounded-xl bg-neutral-gray-10" />
    );
  }

  return (
    <div className={cn('w-full h-full', className)}>
      <div className="overflow-hidden rounded-xl h-full">
        <GoogleMap
          mapContainerStyle={{ ...MAP_CONTAINER_STYLE, ...mapContainerStyle }}
          center={center}
          zoom={zoom}
          onLoad={map => {
            mapRef.current = map;
          }}
          onZoomChanged={() => {
            if (mapRef.current) setZoom(mapRef.current.getZoom() ?? 12);
          }}
          onClick={() => setSelectedShop(null)}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            styles: MAP_STYLES,
          }}
        >
          {shops.map(shop => (
            <Marker
              key={shop.id}
              position={{ lat: shop.lat, lng: shop.lng }}
              title={shop.name}
              icon={SHOP_MARKER_ICON}
              onClick={e => {
                e.stop?.();
                setSelectedShop(shop);
              }}
            />
          ))}

          {selectedShop && (
            <InfoWindow
              position={{
                lat: selectedShop.lat + (POPUP_OFFSET[zoom] ?? 0.013),
                lng: selectedShop.lng,
              }}
              options={{
                disableAutoPan: true,
                pixelOffset: new google.maps.Size(0, 0),
              }}
              onCloseClick={() => setSelectedShop(null)}
            >
              <MapPopup shop={selectedShop} />
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </div>
  );
}
