import { Icon } from "leaflet";
import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

interface LocationPickerMapProps {
  latitude: number;
  longitude: number;
  onChange: (coords: { latitude: number; longitude: number }) => void;
}

const markerIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function ClickHandler({ onChange }: Pick<LocationPickerMapProps, "onChange">) {
  useMapEvents({
    click(event) {
      onChange({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  return null;
}

function MapUpdater({
  latitude,
  longitude,
}: Pick<LocationPickerMapProps, "latitude" | "longitude">) {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude], 15);
  }, [latitude, longitude, map]);

  return null;
}

export function LocationPickerMap({
  latitude,
  longitude,
  onChange,
}: LocationPickerMapProps) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={13}
      scrollWheelZoom
      className="h-full w-full rounded-2xl"
    >
      <MapUpdater latitude={latitude} longitude={longitude} />

      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ClickHandler onChange={onChange} />

      <Marker position={[latitude, longitude]} icon={markerIcon} />
    </MapContainer>
  );
}