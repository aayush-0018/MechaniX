'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import WorkerCard from "@/components/ui/WorkerCard";

async function fetchWorkers(skill: string, lat: string, lng: string, sortBy: string, radius: number) {
    const res = await fetch(
        `http://localhost:3000/api/workers?skill=${skill}&lat=${lat}&lng=${lng}&sortBy=${sortBy}&radius=${radius}`,
        { cache: 'no-store' }
    );
    if (!res.ok) throw new Error('Failed to fetch workers');
    return res.json();
}

export default function Page({ params }: { params: { skill: string } }) {
    const skill = 'mechanic';
    const capitalizedSkill = skill.charAt(0).toUpperCase() + skill.slice(1);

    const searchParams = useSearchParams();
    const lat = searchParams.get('lat') || '';
    const lng = searchParams.get('lng') || '';

    const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'both'>('distance');
    const [radius, setRadius] = useState<number>(5); // default 5 km
    const [workers, setWorkers] = useState([]);

    useEffect(() => {
        if (!lat || !lng) return;
        const fetchData = async () => {
            const data = await fetchWorkers(skill, lat, lng, sortBy, radius);
            setWorkers(data);
        };
        fetchData();
    }, [skill, lat, lng, sortBy, radius]);

    return (
        <div className="min-h-screen p-6 bg-gray-100">
            <h1 className="text-3xl font-bold mb-6">Nearby Mechanics</h1>

            <div className="flex flex-wrap gap-4 mb-6">
                <div>
                    <label className="mr-2 font-medium">Sort by:</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'rating' | 'distance' | 'both')}
                        className="px-3 py-2 rounded border"
                    >
                        <option value="distance">Closest First</option>
                        <option value="rating">Best Rated</option>
                        <option value="both">Best Rated (Nearby)</option>
                    </select>
                </div>
                <div>
                    <label className="mr-2 font-medium">Radius:</label>
                    <select
                        value={radius}
                        onChange={(e) => setRadius(Number(e.target.value))}
                        className="px-3 py-2 rounded border"
                    >
                        <option value={1}>1 km</option>
                        <option value={3}>3 km</option>
                        <option value={5}>5 km</option>
                        <option value={10}>10 km</option>
                    </select>
                </div>
            </div>

            {workers.length === 0 ? (
                <p className="text-gray-600">No {capitalizedSkill.toLowerCase()}s found nearby.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {workers.map((worker: any) => (
                        <WorkerCard key={worker.id} worker={worker} lat={lat} lng={lng} />
                    ))}
                </div>
            )}
        </div>
    );
}
