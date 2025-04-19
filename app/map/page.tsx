'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import 'leaflet-routing-machine';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Custom icons
const customerIcon = new L.Icon({
    iconUrl: '/icons/home.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
});

const workerIcon = new L.Icon({
    iconUrl: '/icons/scooter.png',
    iconSize: [45, 45],
    iconAnchor: [22, 45],
    popupAnchor: [0, -40],
});

// Routing component
function RoutingWithMovement({ from, to, onRouteReady }: any) {
    const map = useMap();

    useEffect(() => {
        if (!map || !from || !to) return;

        const routingControl = L.Routing.control({
            waypoints: [L.latLng(from.lat, from.lng), L.latLng(to.lat, to.lng)],
            routeWhileDragging: false,
            draggableWaypoints: false,
            addWaypoints: false,
            show: false,
        }).addTo(map);

        routingControl.on('routesfound', function (e: any) {
            const route = e.routes[0];
            const coordinates = route.coordinates.map((c: any) => ({
                lat: c.lat,
                lng: c.lng,
            }));

            const etaInSeconds = route.summary.totalTime;
            onRouteReady(coordinates, etaInSeconds);
        });

        return () => map.removeControl(routingControl);
    }, [map, from, to]);

    return null;
}

const updateWorkerAvailability = async (isAvailable: boolean, workerId: string | null) => {
    if (!workerId) return;

    try {
        const res = await fetch(`/api/workers/${workerId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ isAvailable }),
        });

        const data = await res.json();
        if (!res.ok) {
            console.error('Failed to update availability:', data.error);
        } else {
            console.log('Worker availability updated:', data.updatedWorker);
        }
    } catch (error) {
        console.error('API error:', error);
    }
};

export default function MapPage() {
    const { data: session } = useSession();
    const customerId = session?.user?.id ?? null;
    const router = useRouter();
    const searchParams = useSearchParams();
    const workerId = searchParams.get('workerId');
    const bookingId = searchParams.get('bookingId');

    const [customerLocation, setCustomerLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [initialWorkerLocation, setInitialWorkerLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [workerPos, setWorkerPos] = useState<{ lat: number; lng: number } | null>(null);
    const [routePoints, setRoutePoints] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [eta, setEta] = useState<number | null>(null);

    // Fetch locations
    useEffect(() => {
        if (!workerId || !customerId) return;

        const fetchWorkerLocations = async () => {
            const res = await fetch(`/api/workers/${workerId}`);
            const data = await res.json();

            if (res.ok) {
                const workerLoc = { lat: data.latitude, lng: data.longitude };
                setInitialWorkerLocation(workerLoc);
                setWorkerPos(workerLoc);
            } else {
                console.error('Error fetching worker location:', data.error);
            }

            const res1 = await fetch(`/api/workers/${customerId}`);
            const data1 = await res1.json();

            if (res1.ok) {
                setCustomerLocation({ lat: data1.latitude, lng: data1.longitude });
            } else {
                console.error('Error fetching customer location:', data1.error);
            }
        };

        fetchWorkerLocations();
    }, [workerId, customerId]);

    // Animate worker movement
    useEffect(() => {
        if (routePoints.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => {
                const nextIndex = prev + 1;

                if (nextIndex >= routePoints.length) {
                    clearInterval(interval);
                    updateWorkerAvailability(false, workerId);
                    router.push(`/work-status?workerId=${workerId}&bookingId=${bookingId}`);
                    return prev;
                }

                setWorkerPos(routePoints[nextIndex]);
                return nextIndex;
            });
        }, 700);

        return () => clearInterval(interval);
    }, [routePoints]);

    const etaMinutes = eta ? Math.ceil(eta / 60) : null;

    return (
        <div className="h-screen w-full relative">
            {customerLocation && initialWorkerLocation && workerPos ? (
                <MapContainer
                    center={customerLocation}
                    zoom={15}
                    scrollWheelZoom
                    className="h-full w-full"
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                    />

                    <Marker position={customerLocation} icon={customerIcon}>
                        <Popup>🏠 Customer Location</Popup>
                    </Marker>

                    <Marker position={workerPos} icon={workerIcon}>
                        <Popup>🛵 Worker En Route</Popup>
                    </Marker>

                    <RoutingWithMovement
                        from={initialWorkerLocation}
                        to={customerLocation}
                        onRouteReady={(points: any[], etaInSeconds: number) => {
                            setRoutePoints(points);
                            setEta(etaInSeconds);
                        }}
                    />
                </MapContainer>
            ) : (
                <div className="flex justify-center items-center h-full">
                    <p className="text-gray-600 text-lg">Loading map...</p>
                </div>
            )}

            {/* ETA and Status Overlay */}
            {etaMinutes !== null && (
                <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-xl shadow-md text-sm font-medium z-[999]">
                    <p>🛵 Worker is on the way</p>
                    <p className="text-blue-600 font-semibold">ETA: {etaMinutes} min</p>
                </div>
            )}
        </div>
    );
}
