'use strict';
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from './LanguageProvider';
import { MapPin, Navigation, Info } from 'lucide-react';

// Fictional Wards list with coordinates center points
export const WardsData = [
  { id: "W1", name: "Ward 1 - Gandhi Nagar", center: { lat: 12.9716, lng: 77.5946 }, color: "#3B82F6" },
  { id: "W2", name: "Ward 2 - Subhash Nagar", center: { lat: 12.9800, lng: 77.5800 }, color: "#10B981" },
  { id: "W3", name: "Ward 3 - Indiranagar", center: { lat: 12.9784, lng: 77.6408 }, color: "#F59E0B" },
  { id: "W4", name: "Ward 4 - Ashok Nagar", center: { lat: 12.9600, lng: 77.6100 }, color: "#8B5CF6" },
  { id: "W5", name: "Ward 5 - Shivaji Nagar", center: { lat: 12.9850, lng: 77.6000 }, color: "#EC4899" },
  { id: "W6", name: "Ward 6 - Nehru Nagar", center: { lat: 12.9920, lng: 77.5900 }, color: "#06B6D4" },
  { id: "W7", name: "Ward 7 - Shastri Nagar", center: { lat: 12.9500, lng: 77.5700 }, color: "#14B8A6" },
  { id: "W8", name: "Ward 8 - Patel Nagar", center: { lat: 12.9400, lng: 77.6000 }, color: "#6366F1" },
];

interface MapboxPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string, ward: string) => void;
  selectedLat?: number;
  selectedLng?: number;
}

export const MapboxPicker: React.FC<MapboxPickerProps> = ({
  onLocationSelect,
  selectedLat,
  selectedLng,
}) => {
  const { t } = useLanguage();
  const mapContainer = useRef<HTMLDivElement>(null);
  const [useMock, setUseMock] = useState(true);
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    selectedLat && selectedLng ? { lat: selectedLat, lng: selectedLng } : null
  );
  const [currentWard, setCurrentWard] = useState<string>('');

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    const isMockToken = !token || token.includes('placeholder') || token.trim() === '';
    setUseMock(isMockToken);

    if (!isMockToken && mapContainer.current) {
      // Dynamic import to prevent SSR issues with Mapbox GL
      import('mapbox-gl').then((mapboxglModule) => {
        const mapboxgl = mapboxglModule.default;
        mapboxgl.accessToken = token!;

        const map = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/dark-v11',
          center: [77.5946, 12.9716], // Bangalore center
          zoom: 11,
        });

        map.addControl(new mapboxgl.NavigationControl(), 'top-right');

        const mapMarker = new mapboxgl.Marker({ color: '#F97316', draggable: true })
          .setLngLat([selectedLng || 77.5946, selectedLat || 12.9716])
          .addTo(map);

        const updateLocation = async (lng: number, lat: number) => {
          setMarker({ lat, lng });
          
          // Determine Ward based on closest center
          let closestWard = WardsData[0];
          let minDistance = Infinity;
          WardsData.forEach((w) => {
            const dist = Math.pow(w.center.lat - lat, 2) + Math.pow(w.center.lng - lng, 2);
            if (dist < minDistance) {
              minDistance = dist;
              closestWard = w;
            }
          });

          const mockAddress = `${Math.floor(lat * 100) % 100}, Lane ${Math.floor(lng * 100) % 10 + 1}, Near Market, ${closestWard.name.split(' - ')[1]}, Nagar City`;
          setCurrentWard(closestWard.name);
          onLocationSelect(lat, lng, mockAddress, closestWard.name);
        };

        map.on('click', (e) => {
          mapMarker.setLngLat(e.lngLat);
          updateLocation(e.lngLat.lng, e.lngLat.lat);
        });

        mapMarker.on('dragend', () => {
          const lngLat = mapMarker.getLngLat();
          updateLocation(lngLat.lng, lngLat.lat);
        });

        // Initialize with default marker
        if (selectedLat && selectedLng) {
          updateLocation(selectedLng, selectedLat);
        } else {
          updateLocation(77.5946, 12.9716);
        }

        return () => map.remove();
      }).catch((err) => {
        console.warn('Mapbox rendering failed. Reverting to high-fidelity mock map.', err);
        setUseMock(true);
      });
    }
  }, [selectedLat, selectedLng]);

  // Mock Map interactions
  const handleMockMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapContainer.current) return;
    const rect = mapContainer.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert pixel to relative coordinates inside Bangalore boundaries
    const lngMin = 77.5500;
    const lngMax = 77.6500;
    const latMin = 12.9300;
    const latMax = 13.0000;

    const percentX = x / rect.width;
    const percentY = 1 - (y / rect.height); // Flip Y for latitude

    const lng = lngMin + percentX * (lngMax - lngMin);
    const lat = latMin + percentY * (latMax - latMin);

    // Find closest ward
    let closestWard = WardsData[0];
    let minDistance = Infinity;
    WardsData.forEach((w) => {
      const dist = Math.pow(w.center.lat - lat, 2) + Math.pow(w.center.lng - lng, 2);
      if (dist < minDistance) {
        minDistance = dist;
        closestWard = w;
      }
    });

    const mockAddress = `${Math.floor(lat * 1000) % 99 + 1}, Ward Road, Opposite Park, ${closestWard.name.split(' - ')[1]}, Nagar City`;

    setMarker({ lat, lng });
    setCurrentWard(closestWard.name);
    onLocationSelect(lat, lng, mockAddress, closestWard.name);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center justify-between">
        <span>{t.locationLabel}</span>
        {currentWard && (
          <span className="text-xs font-semibold bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/30">
            {currentWard}
          </span>
        )}
      </label>

      <div
        ref={mapContainer}
        className="relative w-full h-[250px] rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shadow-inner flex items-center justify-center cursor-crosshair group"
        onClick={useMock ? handleMockMapClick : undefined}
      >
        {useMock && (
          <div className="absolute inset-0 bg-slate-950 flex flex-col justify-between p-4 select-none">
            {/* Grid Background representing simulated city map */}
            <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 opacity-20 pointer-events-none">
              {Array.from({ length: 48 }).map((_, i) => (
                <div key={i} className="border border-slate-700"></div>
              ))}
            </div>
            
            {/* Interactive Ward boundaries visualized */}
            <div className="absolute inset-0 flex flex-wrap pointer-events-none opacity-20">
              {WardsData.map((ward) => (
                <div
                  key={ward.id}
                  className="w-1/4 h-1/2 flex items-center justify-center border-dashed border border-slate-800 text-[10px]"
                  style={{ backgroundColor: `${ward.color}22` }}
                >
                  {ward.name.split(' - ')[1]}
                </div>
              ))}
            </div>

            {/* HUD details */}
            <div className="z-10 flex items-center gap-1.5 text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-md max-w-fit pointer-events-none font-mono">
              <Navigation size={12} className="animate-pulse" />
              <span>Simulated Nagar City Interactive Mapping Engine</span>
            </div>

            <div className="z-10 flex flex-col items-center justify-center w-full grow pointer-events-none text-center">
              {!marker && (
                <div className="animate-bounce p-3 bg-orange-500/20 text-orange-400 rounded-full border border-orange-500/30">
                  <MapPin size={24} />
                </div>
              )}
              {!marker && (
                <p className="text-xs text-slate-400 mt-2">
                  Click anywhere on the grid to drop your complaint coordinates.
                </p>
              )}
            </div>

            {/* Render selected marker dynamically */}
            {marker && (
              <div
                className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full flex flex-col items-center"
                style={{
                  left: `${((marker.lng - 77.5500) / 0.1000) * 100}%`,
                  top: `${(1 - (marker.lat - 12.9300) / 0.0700) * 100}%`,
                }}
              >
                <div className="p-2 bg-orange-500 text-slate-950 rounded-full shadow-lg shadow-orange-500/50 border border-orange-400">
                  <MapPin size={20} className="fill-current" />
                </div>
                <div className="mt-1 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-900 border border-slate-700 text-slate-300 rounded shadow-md whitespace-nowrap">
                  {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
                </div>
              </div>
            )}

            {/* Map Info footer */}
            <div className="z-10 flex justify-between items-end text-[10px] text-slate-500 pointer-events-none">
              <span>LAT: 12.9300 - 13.0000 N</span>
              <span className="flex items-center gap-1"><Info size={10} /> Click to change coordinates</span>
              <span>LNG: 77.5500 - 77.6500 E</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
