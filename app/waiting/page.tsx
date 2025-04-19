'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function WaitingPage() {
    const searchParams = useSearchParams();
    const bookingId = searchParams.get('bookingId');
    const router = useRouter();
    const amount = searchParams.get('amount');
    const workerId = searchParams.get('workerId');

    const [status, setStatus] = useState('pending');

    useEffect(() => {
        if (!bookingId) return;

        const channel = supabase
            .channel('booking-status-watcher')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'Booking',
                    filter: `id=eq.${bookingId}`,
                },
                (payload) => {
                    const updatedStatus = payload.new.status;
                    console.log('Booking status updated:', updatedStatus);

                    if (updatedStatus === 'accepted') {
                        router.push(`/booking-success?bookingId=${bookingId}&amount=${amount}&workerId=${workerId}`);
                    } else if (updatedStatus === 'cancelled') {
                        router.push('/requestcancel');
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [bookingId]);

    return (
        <div className="min-h-screen flex flex-col justify-center items-center text-center px-6">
            <h1 className="text-2xl font-bold mb-2">⏳ Waiting for worker response</h1>
            <p className="text-muted-foreground">Your booking is being reviewed. Hang tight!</p>
        </div>
    );
}
