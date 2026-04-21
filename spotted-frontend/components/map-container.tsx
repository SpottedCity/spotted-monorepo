import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useEffect } from 'react';
import { MapContainer as Map, Marker, TileLayer, useMap } from 'react-leaflet';

import ReportPopup from '@/components/report-popup';
import { useAuth } from '@/context/auth-context';
import { useNearbyPosts } from '@/hooks/use-nearby-posts';
import { getCategoryIcon } from '@/utils/mapMarkers';
import { useLocation } from '@/hooks/useLocation';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 13, { duration: 1.5 });
  }, [center, map]);
  return null;
};

// Dodajemy prop refreshTick
interface LeafletMapProps {
  filterCategoryId?: string | null;
  refreshTick?: number;
}

const LeafletMap = ({ filterCategoryId, refreshTick }: LeafletMapProps) => {
  const { user } = useAuth();
  const { location: gpsLocation } = useLocation();

  const polandBounds: L.LatLngBoundsExpression = [
    [48.8, 14.0],
    [55.0, 24.5]
  ];

  const defaultLat = 52.0693;
  const defaultLng = 19.4803;

  const lat = gpsLocation?.latitude || user?.selectedCity?.latitude || defaultLat;
  const lng = gpsLocation?.longitude || user?.selectedCity?.longitude || defaultLng;
  const mapCenter: [number, number] = [lat, lng];

  // Wyciągamy też refetch, aby użyć go po wejściu na zakładkę
  const { posts, isLoading, refetch } = useNearbyPosts(lat, lng, 20);

  // Wymusza pobranie od nowa danych z API, jeżeli zakładka staje się aktywna
  useEffect(() => {
    if (refreshTick && refreshTick > 0) {
      refetch();
    }
  }, [refreshTick, refetch]);

  const filteredPosts = posts.filter(
    (p) => !filterCategoryId || p.category.id === filterCategoryId
  );

  return (
    <Map
      center={mapCenter}
      zoom={13}
      minZoom={6}
      maxBounds={polandBounds}
      maxBoundsViscosity={1.0}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%', position: 'absolute' }}
      zoomControl={false}
    >
      <MapUpdater center={mapCenter} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      {!isLoading &&
        filteredPosts.map((post) => {
          const icon =
            typeof window !== 'undefined' ? getCategoryIcon(post.category.slug) : undefined;
          return (
            <Marker key={post.id} position={[post.latitude, post.longitude]} icon={icon}>
              <ReportPopup
                report={post}
                onPostDeleted={() => {
                  refetch(); // Możemy użyć tu `refetch` zamiast window.location.reload()
                }}
              />
            </Marker>
          );
        })}
    </Map>
  );
};

export default LeafletMap;
