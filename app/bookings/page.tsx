'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface Booking {
    id: string;
    status: string;
    bookedAt: string;
    amount: number;
    worker: { name: string };
    customer: { name: string };
}

export default function BookingsPage() {
    const { data: session } = useSession();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [role, setRole] = useState<'customer' | 'worker'>('customer');
    const customerId = session?.user.id;

    useEffect(() => {
        if (!session?.user?.id) return;

        const fetchBookings = async () => {
            const res = await fetch(
                `/api/bookings?userId=${customerId}&role=${role}`
            );
            const data = await res.json();
            setBookings(data);
        };

        fetchBookings();
    }, [session?.user?.id, role]);

    return (
        <div className="p-6 min-h-screen bg-gray-100">
            <h1 className="text-2xl font-bold mb-4">My Bookings ({role})</h1>

            <div className="mb-4">
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'customer' | 'worker')}
                    className="px-3 py-2 border rounded"
                >
                    <option value="customer">As Customer</option>
                    <option value="worker">As Worker</option>
                </select>
            </div>

            {bookings.length === 0 ? (
                <p className="text-gray-600">No bookings found.</p>
            ) : (
                <div className="grid gap-4">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="bg-white p-4 rounded shadow">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-lg font-medium">
                                        {role === 'customer' ? booking.worker.name : booking.customer.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Status: {booking.status} | Amount: ₹{booking.amount}
                                    </p>
                                </div>
                                <p className="text-sm text-gray-400">
                                    {new Date(booking.bookedAt).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
