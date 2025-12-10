import React, { useState, useEffect } from 'react';
import { Map, Marker, ZoomControl } from 'pigeon-maps';
import { MapLocation } from '../types';

interface PixelMapProps {
  center: [number, number];
  zoom: number;
  onBoundsChanged: (data: { center: [number, number]; zoom: number }) => void;
  markers?: MapLocation[];
}

export const PixelMap: React.FC<PixelMapProps> = ({ center, zoom, onBoundsChanged, markers }) => {
  // Esri World Imagery (Satellite)
  const mapTilerProvider = (x: number, y: number, z: number, dpr?: number) => {
    return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;
  };

  return (
    <div className="w-full h-full relative bg-[#050505] overflow-hidden border-2 border-[#33ff00]">
      {/* Heavy CSS filters for the pixel art aesthetic */}
      <div className="absolute inset-0 z-0 pixel-map" style={{ filter: 'contrast(1.2) brightness(0.8) saturate(0.6) sepia(0.2)' }}>
        <Map 
          height={1000} // Let parent control actual size via CSS overflow hidden
          defaultCenter={[35.6895, 139.6917]} 
          center={center} 
          zoom={zoom} 
          provider={mapTilerProvider}
          onBoundsChanged={onBoundsChanged}
        >
          {markers?.map((m, i) => (
            <Marker 
              key={i} 
              width={50} 
              anchor={[m.lat, m.lng]} 
              color="#33ff00" 
            />
          ))}
          {/* We hide the default zoom control and implement our own or style this one? 
              Pigeon maps ZoomControl is simple SVG. Let's leave it but it might look too clean.
              We can just omit it and use buttons.
          */}
        </Map>
      </div>

      {/* Grid Overlay to enhance 8-bit feel */}
      <div className="absolute inset-0 pointer-events-none z-10" 
           style={{ 
             backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, #000 1px, #000 2px), repeating-linear-gradient(90deg, transparent, transparent 1px, #000 1px, #000 2px)',
             backgroundSize: '4px 4px',
             opacity: 0.3
           }}
      />
      
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-[radial-gradient(circle,transparent_50%,rgba(0,0,0,0.8)_100%)]"></div>

      {/* Crosshair Center */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 text-[#33ff00] opacity-50">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 0V40M0 20H40" stroke="currentColor" strokeWidth="2" />
            <rect x="15" y="15" width="10" height="10" border="1" stroke="currentColor" strokeWidth="2" fill="none"/>
        </svg>
      </div>
    </div>
  );
};
