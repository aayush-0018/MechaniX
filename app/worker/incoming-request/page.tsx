'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useSession } from 'next-auth/react';

export default function IncomingRequest() {
    const [incomingBooking, setIncomingBooking] = useState<any>(null);
    const { data: session } = useSession();
    const workerId = session?.user?.id;

    useEffect(() => {
        if (!workerId) return;

        const channel = supabase
            .channel('worker-bookings')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'Booking',
                },
                (payload) => {
                    const booking = payload.new;
                    console.log("➡️ Booking payload received:", booking);

                    if (booking.workerId === workerId && booking.status === 'pending') {
                        setIncomingBooking(booking);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [workerId]);

    const handleResponse = async (status: 'accepted' | 'cancelled') => {
        if (!incomingBooking) return;

        try {
            const res = await fetch(`/api/bookings/${incomingBooking.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            });

            if (!res.ok) {
                throw new Error('Failed to update booking status');
            }

            const data = await res.json();
            console.log('Booking status updated:', data);
            setIncomingBooking(null);
        } catch (err) {
            console.error('Error updating booking:', err);
            alert('Something went wrong while updating the booking.');
        }
    };

    if (!incomingBooking) return <p className="text-center mt-10">No incoming bookings yet.</p>;

    // Normalize mediaUrls in case it's a stringified JSON
    const mediaUrls: string[] = typeof incomingBooking.mediaUrls === 'string'
        ? JSON.parse(incomingBooking.mediaUrls)
        : incomingBooking.mediaUrls;

    return (
        <div className="p-6 bg-yellow-100 text-black rounded-md shadow-md max-w-xl mx-auto mt-10">
            <h2 className="text-2xl font-bold mb-2">New Incoming Request</h2>
            <p className="mb-1">Booking ID: {incomingBooking.id}</p>
            <p className="mb-4">Amount: ₹{incomingBooking.amount}</p>

            {/* Media Preview */}
            {mediaUrls?.length > 0 && (
                <div className="mt-4">
                    <h3 className="font-semibold mb-2">📸 Uploaded Media:</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {mediaUrls.map((url, index) =>
                            url.match(/\.(mp4|webm|ogg)$/i) ? (
                                <video
                                    key={index}
                                    src={url}
                                    controls
                                    className="w-full h-auto rounded shadow"
                                />
                            ) : (
                                <img
                                    key={index}
                                    src={url}
                                    alt={`Uploaded media ${index + 1}`}
                                    className="w-full h-auto rounded shadow"
                                />
                            )
                        )}
                    </div>
                </div>
            )}

            <div className="flex gap-4 mt-6">
                <button
                    onClick={() => handleResponse('accepted')}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                >
                    Accept
                </button>
                <button
                    onClick={() => handleResponse('cancelled')}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                >
                    Reject
                </button>
            </div>
        </div>
    );
}
