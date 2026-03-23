import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React from 'react';
import { MapContainer as Map, Marker, TileLayer } from 'react-leaflet'; // Usunąłem stąd Popup

import ReportPopup from '@/components/report-popup'; // Importujemy nasz nowy komponent!
import { mockReports } from '@/constants/map-data';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

const LeafletMap = () => {
  const polandBounds: L.LatLngBoundsExpression = [
    [48.8, 14.0],
    [55.0, 24.5]
  ];

  return (
    <Map
      center={[53.1235, 18.0084]}
      zoom={13}
      minZoom={6}
      maxBounds={polandBounds}
      maxBoundsViscosity={1.0}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%', position: 'absolute' }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      {mockReports.map((report) => (
        <Marker key={report.id} position={[report.lat, report.lng]}>
          <ReportPopup report={report} />
        </Marker>
      ))}
    </Map>
  );
};

export default LeafletMap;
