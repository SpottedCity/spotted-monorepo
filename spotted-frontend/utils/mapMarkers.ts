import React from 'react';
import * as L from 'leaflet';

export const getCategoryIcon = (categorySlug: string) => {
  if (typeof window === 'undefined') return undefined;

  let emoji = '📌';
  let color = '#3B82F6'; // Default blue

  switch (categorySlug) {
    case 'wypadek':
      emoji = '🚨';
      color = '#EF4444'; // res
      break;
    case 'policja':
      emoji = '🚔';
      color = '#2563EB'; // blue
      break;
    case 'niebezpieczenstwo':
      emoji = '⚠️';
      color = '#EAB308'; // orange
      break;
    case 'awaria':
      emoji = '🔧';
      color = '#F97316'; // amber
      break;
    case 'wydarzenie':
      emoji = '📢';
      color = '#8B5CF6'; // default
      break;
    case 'zguba':
      emoji = '🔍';
      color = '#6B7280'; // gray
      break;
    case 'zrobione':
      emoji = '✓';
      color = '#22C55E'; // green
      break;
    case 'spolecznosc':
      emoji = '👥';
      color = '#06B6D4'; // teal
      break;
  }

  const markerHtml = `
    <div style="
      background-color: ${color};
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      font-size: 16px;
    ">
      ${emoji}
    </div>
  `;

  return L.divIcon({
    html: markerHtml,
    className: 'custom-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  });
};
