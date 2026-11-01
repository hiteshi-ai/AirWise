import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { MonitoringStation } from '../../types';
import { getAqiColor, AqiBadge } from '../common/AqiBadge';
import { MapPin, Clock } from 'lucide-react';

interface IndiaAirMapProps {
  stations: MonitoringStation[];
  selectedStationId?: number;
  onSelectStation: (station: MonitoringStation) => void;
}

export const IndiaAirMap: React.FC<IndiaAirMapProps> = ({
  stations,
  selectedStationId,
  onSelectStation,
}) => {
  const indiaCenter: [number, number] = [21.5, 80.5]; // Central India

  return (
    <div className="relative w-full h-[450px] sm:h-[520px] rounded-2xl overflow-hidden border border-theme-border shadow-xs">
      <MapContainer
        center={indiaCenter}
        zoom={5}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {stations.map((st) => {
          const color = getAqiColor(st.aqiValue, st.aqiCategory);
          const isSelected = selectedStationId === st.id;

          return (
            <CircleMarker
              key={st.id}
              center={[st.latitude, st.longitude]}
              radius={isSelected ? 10 : 7}
              pathOptions={{
                color: isSelected ? '#1e1b4b' : '#ffffff',
                weight: isSelected ? 3 : 1.5,
                fillColor: color,
                fillOpacity: 0.9,
              }}
              eventHandlers={{
                click: () => onSelectStation(st),
              }}
            >
              <Popup className="custom-popup">
                <div className="p-1 space-y-2 text-xs font-sans max-w-[220px]">
                  <div>
                    <h4 className="font-bold text-gray-900 leading-tight">{st.stationName}</h4>
                    <p className="text-[11px] text-gray-500 font-medium">
                      {st.city}, {st.state}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                    <span className="text-[11px] text-gray-600 font-semibold">Official AQI:</span>
                    <AqiBadge value={st.aqiValue} category={st.aqiCategory} size="sm" />
                  </div>

                  {st.prominentPollutant && (
                    <div className="text-[10px] text-gray-600">
                      Prominent: <span className="font-bold text-gray-800">{st.prominentPollutant}</span>
                    </div>
                  )}

                  <div className="text-[9px] text-gray-400 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    <span>
                      {st.observationTime
                        ? new Date(st.observationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'No Data'}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectStation(st)}
                    className="w-full mt-1.5 py-1 px-2 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors text-center"
                  >
                    View Station Details &rarr;
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-xs p-2.5 rounded-xl border border-gray-200 shadow-md text-[10px] text-gray-800 space-y-1">
        <div className="font-bold text-[11px] text-gray-900 mb-1">CPCB IND-AQI Scale</div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#16a34a]" />
          <span>Good (0–50)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#65a30d]" />
          <span>Satisfactory (51–100)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ca8a04]" />
          <span>Moderate (101–200)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ea580c]" />
          <span>Poor (201–300)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626]" />
          <span>Very Poor (301–400)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#7f1d1d]" />
          <span>Severe (401–500)</span>
        </div>
      </div>
    </div>
  );
};

