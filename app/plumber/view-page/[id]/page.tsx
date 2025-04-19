'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Worker {
    id: string;
    name: string;
    image?: string;
    isAvailable: boolean;
    skills: string[];
    location?: string;
    distance: number;
}

interface Review {
    id: string;
    rating: number;
    comment?: string;
    createdAt: string;
    customer: {
        name: string;
        image?: string;
    };
}

const dummyActivities = {
    'Engine Check-up': 500,
    'Oil Change': 300,
    'Brake Inspection': 250,
    'Battery Replacement': 800,
    'Tire Replacement': 1000,
    'AC Repair': 600,
    'Wheel Alignment': 400,
    'Suspension Repair': 700,
    'Clutch Repair': 1200,
};

export default function ViewWorkerPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const params = useParams();
    const workerId = params?.id as string;

    const [worker, setWorker] = useState<Worker | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);

    useEffect(() => {
        const lat = searchParams.get('lat');
        const lng = searchParams.get('lng');

        if (!workerId || !lat || !lng) {
            console.error('Missing required query params');
            return;
        }

        async function fetchWorker() {
            try {
                const response = await fetch(`/api/workers/${workerId}?lat=${lat}&lng=${lng}`);
                if (response.ok) {
                    const data = await response.json();
                    setWorker(data);
                } else {
                    console.error('Worker not found');
                }
            } catch (error) {
                console.error('Error fetching worker:', error);
            }
        }

        async function fetchReviews() {
            try {
                const res = await fetch(`/api/workers/fetchReviews/${workerId}`);
                if (res.ok) {
                    const data = await res.json();
                    setReviews(data);
                } else {
                    console.error('Failed to fetch reviews');
                }
            } catch (err) {
                console.error('Error fetching reviews:', err);
            }
        }

        fetchWorker();
        fetchReviews();
    }, [workerId, searchParams]);

    if (!worker) {
        return <p className="p-6 text-center text-lg font-semibold">Loading worker details...</p>;
    }

    const handleBookService = () => {
        router.push(`/book?workerId=${worker.id}`);
    };

    return (
        <div className="min-h-screen w-full p-6 bg-gradient-to-br from-slate-50 to-slate-200 dark:from-gray-900 dark:to-black">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-lg border">
                    <div className="w-full md:w-1/3 flex items-center justify-center p-6">
                        <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-lg">
                            <Image
                                src={worker.image?.trim() || '/default-avatar.png'}
                                alt={worker.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                    <div className="p-6 w-full md:w-2/3">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{worker.name}</h1>
                        {typeof worker.distance === 'number' && (
                            <p className="text-muted-foreground mt-1">
                                {worker.location || 'Jaipur, Rajasthan'} • {worker.distance.toFixed(2)} km away
                            </p>
                        )}
                        <div className="mt-3">
                            <Badge className={worker.isAvailable ? 'bg-green-500' : 'bg-red-500'}>
                                {worker.isAvailable ? 'Available' : 'Unavailable'}
                            </Badge>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {Array.isArray(worker.skills) && worker.skills.map((skill) => (
                                <Badge
                                    key={skill}
                                    className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-white"
                                >
                                    {skill}
                                </Badge>
                            ))}
                        </div>

                        <div className="mt-6 flex gap-4 flex-wrap">
                            <Button onClick={() => router.back()} className="bg-black hover:bg-gray-800 text-white">
                                ← Go Back
                            </Button>
                            <Button
                                onClick={handleBookService}
                                disabled={!worker.isAvailable}
                                className="bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400 disabled:opacity-50"
                            >
                                {worker.isAvailable ? 'Book Service' : 'Not Available'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Services Offered */}
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-md border">
                    <h2 className="text-2xl font-semibold mb-4">Services Offered</h2>
                    <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(dummyActivities).map(([service, cost]) => (
                            <li key={service} className="bg-muted/30 p-4 rounded-md flex justify-between items-center">
                                <span>{service}</span>
                                <span className="text-black font-medium">₹{cost}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Customer Reviews */}
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-md border">
                    <h2 className="text-2xl font-semibold mb-4">Customer Reviews</h2>
                    {reviews.length === 0 ? (
                        <p className="text-muted-foreground">No reviews yet.</p>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {reviews.map((review) => (
                                <div key={review.id} className="border border-border p-4 rounded-md bg-muted/40">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Image
                                            src={review.customer.image?.trim() || '/default-avatar.png'}
                                            alt={review.customer.name}
                                            width={40}
                                            height={40}
                                            className="rounded-full"
                                        />
                                        <div>
                                            <p className="font-semibold">{review.customer.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-yellow-500 font-medium">⭐ {review.rating}/5</p>
                                    {review.comment && (
                                        <p className="mt-1 text-gray-800 dark:text-gray-300">
                                            🗨️ {review.comment}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
