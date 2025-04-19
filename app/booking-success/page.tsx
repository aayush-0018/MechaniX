'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function BookingSuccessPage() {
    const searchParams = useSearchParams();
    const bookingId = searchParams.get('bookingId');
    const amount = searchParams.get('amount');
    const workerId = searchParams.get('workerId');
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.push(`/map?workerId=${workerId}&bookingId=${bookingId}`);
        }, 5000);
        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black text-black dark:text-white p-6">
            <h1 className="text-4xl font-bold mb-4 text-center">🎉 Booking Confirmed!</h1>
            <p className="text-lg">Your Booking ID:</p>
            <p className="text-3xl font-extrabold text-green-600 mt-2">{bookingId}</p>
            <p className="text-lg mt-6">Total Amount: {amount}</p>
            <p className="text-sm mt-6 text-muted-foreground text-center">
                Redirecting to map in 5 seconds...
            </p>
        </div>
    );
}
