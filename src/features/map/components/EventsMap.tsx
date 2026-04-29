import { Icon } from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Link } from "react-router-dom";
import type { Event } from "../../events/types/event.types";

interface EventsMapProps {
  events: Event[];
}

const markerIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export function EventsMap({ events }: EventsMapProps) {
  const defaultCenter: [number, number] = [41.3851, 2.1734];

  return (
    <MapContainer
      center={defaultCenter}
      zoom={12}
      scrollWheelZoom
      className="h-full w-full rounded-3xl"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {events.map((event) => (
        <Marker
          key={event.id}
          position={[event.latitude, event.longitude]}
          icon={markerIcon}
        >
          <Popup>
            <div className="min-w-48">
              <p className="text-sm font-bold">{event.title}</p>
              <p className="mt-1 text-xs capitalize text-slate-500">
                {event.type}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {event.locationName}
              </p>

              <Link
                to={`/events/${event.id}`}
                className="mt-3 inline-block rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold hover:bg-blue-700"
              >
                <div className="text-white">
                    View details
                </div>
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}