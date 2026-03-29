import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useEffect } from 'react';
import { MapContainer as Map, Marker, TileLayer, useMap } from 'react-leaflet';

import ReportPopup from '@/components/report-popup';
import { mockReports } from '@/constants/map-data';
import { useProfile } from '@/hooks/use-profile';
import { useAuth } from '@/context/auth-context';
import { useNearbyPosts } from '@/hooks/use-nearby-posts';

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

const LeafletMap = () => {
  const { user } = useAuth();

  const polandBounds: L.LatLngBoundsExpression = [
    [48.8, 14.0],
    [55.0, 24.5]
  ];

  const defaultLat = 52.0693;
  const defaultLng = 19.4803;

  const lat = user?.selectedCity?.latitude || defaultLat;
  const lng = user?.selectedCity?.longitude || defaultLng;
  const mapCenter: [number, number] = [lat, lng];

  const { posts, isLoading } = useNearbyPosts(lat, lng, 20);

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
        posts.map((post) => (
          <Marker key={post.id} position={[post.latitude, post.longitude]}>
            <ReportPopup report={post} />
          </Marker>
        ))}
    </Map>
  );
};

export default LeafletMap;
