import { Icon } from "leaflet";
import { useTranslation } from "react-i18next";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

interface EventLocationMapProps {
    latitude: number;
    longitude: number;
    title: string;
    locationName: string;
}

const markerIcon = new Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

export function EventLocationMap({
    latitude,
    longitude,
    title,
    locationName,
}: EventLocationMapProps) {
    const { t } = useTranslation();

    return (
        <MapContainer
            center={[latitude, longitude]}
            zoom={15}
            scrollWheelZoom={false}
            className="h-full w-full rounded-2xl"
        >
            <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={[latitude, longitude]} icon={markerIcon}>
                <Popup>
                    <div>
                        <p className="font-semibold">{title}</p>
                        <p className="text-sm text-slate-500">{locationName}</p>
                        <p className="mt-2 text-xs font-semibold text-slate-400">
                            {t("mapPage.details")}
                        </p>
                    </div>
                </Popup>
            </Marker>
        </MapContainer>
    );
}
