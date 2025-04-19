'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import Image from 'next/image';
import imageCompression from 'browser-image-compression';

const servicesWithCost: Record<string, number> = {
    'Engine Check-up': 500,
    'Oil Change': 300,
    'Brake Inspection': 250,
    'Battery Replacement': 800,
    'Tire Replacement': 1000,
    'AC Repair': 600,
    'Wheel Alignment': 400,
    'Suspension Repair': 700,
    'Clutch Repair': 1200,
    'Others': 0,
};

export default function BookingPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const customerId = session?.user?.id;
    const searchParams = useSearchParams();
    const workerId = searchParams.get('workerId');

    const [selectedServices, setSelectedServices] = useState<Record<string, number>>({});
    const [othersCost, setOthersCost] = useState<number>(0);
    const [othersLabel, setOthersLabel] = useState<string>('');
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);

    const handleMediaChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);
        setMediaFiles((prev) => [...prev, ...files]);
    };

    const increment = (service: string) => {
        setSelectedServices((prev) => ({
            ...prev,
            [service]: (prev[service] || 0) + 1,
        }));
    };

    const decrement = (service: string) => {
        setSelectedServices((prev) => {
            if (!prev[service]) return prev;
            const updated = { ...prev };
            updated[service] = updated[service] - 1;
            if (updated[service] <= 0) delete updated[service];
            return updated;
        });
    };

    const calculateTotal = () => {
        let total = 0;
        for (const [service, count] of Object.entries(selectedServices)) {
            const rate = service === 'Others' ? othersCost : servicesWithCost[service];
            total += count * rate;
        }
        return total;
    };

    const handleOrder = async () => {
        const totalAmount = calculateTotal();

        try {
            // 1. Compress Images
            const compressedMedia = await Promise.all(
                mediaFiles.map(async (file) => {
                    if (file.type.startsWith('image/')) {
                        return await imageCompression(file, {
                            maxSizeMB: 1,
                            maxWidthOrHeight: 1280,
                            useWebWorker: true,
                        });
                    }
                    return file; // videos are not compressed
                })
            );
            console.log(compressedMedia);

            // 2. Upload Files to Supabase Edge Function
            const formData = new FormData();
            compressedMedia.forEach((file) => {
                formData.append('files', file);
            });
            console.log("FormData entries:");
            for (const [key, value] of formData.entries()) {
                console.log(key, value);
            }

            const uploadRes = await fetch('https://pvvmybetudkwptmixwhy.supabase.co/functions/v1/media-upload', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`, // or hardcoded for now
                },
                body: formData,
            });


            const { urls } = await uploadRes.json();
            console.log(urls);
            if (!uploadRes.ok) throw new Error('Media upload failed');

            // 3. Create Booking
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId,
                    workerId,
                    amount: totalAmount,
                    mediaUrls: urls,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Something went wrong');

            router.push(`/waiting?bookingId=${data.bookingId}&amount=${data.amount}&workerId=${workerId}`);
        } catch (error) {
            console.error('Booking error:', error);
            toast.error('Failed to place order. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-black dark:via-slate-900 dark:to-black p-6">
            <div className="max-w-6xl mx-auto rounded-2xl shadow-2xl overflow-hidden bg-white dark:bg-slate-900 p-6 md:p-10">
                <h1 className="text-4xl font-bold mb-8 text-center text-primary">Book Your Service</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Side - Service List */}
                    <div className="w-full lg:w-2/3 space-y-4">
                        {Object.entries(servicesWithCost).map(([service, cost]) => (
                            service !== 'Others' && (
                                <Card key={service} className="bg-slate-50 dark:bg-slate-800">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-lg font-medium">{service}</p>
                                                <p className="text-muted-foreground">₹{cost}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" onClick={() => decrement(service)}>-</Button>
                                                <span className="w-6 text-center">{selectedServices[service] || 0}</span>
                                                <Button size="sm" onClick={() => increment(service)}>+</Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        ))}
                    </div>

                    {/* Right Side - Others, Upload, Total & Button */}
                    <div className="w-full lg:w-1/3 space-y-6">
                        <Card className="bg-slate-50 dark:bg-slate-800">
                            <CardContent className="p-4 space-y-4">
                                <h2 className="text-xl font-semibold">Other Service</h2>
                                <div className="flex flex-col gap-3">
                                    <Input
                                        placeholder="Other service name"
                                        value={othersLabel}
                                        onChange={(e) => setOthersLabel(e.target.value)}
                                    />
                                    <Input
                                        placeholder="Cost"
                                        type="number"
                                        value={othersCost}
                                        onChange={(e) => setOthersCost(Number(e.target.value))}
                                    />
                                    <div className="flex items-center gap-2">
                                        <Button size="sm" onClick={() => increment('Others')}>Add</Button>
                                        <Button size="sm" variant="outline" onClick={() => decrement('Others')}>Remove</Button>
                                    </div>
                                    {selectedServices['Others'] && (
                                        <p className="text-sm text-muted-foreground">
                                            Count: {selectedServices['Others']} • Total: ₹{othersCost * selectedServices['Others']}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Upload Photo/Video */}
                        <Card className="bg-slate-50 dark:bg-slate-800">
                            <CardContent className="p-4 space-y-4">
                                <h2 className="text-xl font-semibold">Upload Problem Photo/Video</h2>
                                <Input
                                    type="file"
                                    accept="image/*,video/*"
                                    multiple
                                    onChange={handleMediaChange}
                                />
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {mediaFiles.map((file, idx) => (
                                        <div key={idx} className="relative w-20 h-20">
                                            <Image
                                                src={URL.createObjectURL(file)}
                                                alt={`media-${idx}`}
                                                fill
                                                className="object-cover rounded"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Separator />

                        <div className="text-xl font-semibold flex justify-between">
                            <span>Total:</span>
                            <span>₹{calculateTotal()}</span>
                        </div>

                        <Button
                            onClick={handleOrder}
                            className="w-full py-3 text-lg font-bold"
                            disabled={calculateTotal() === 0}
                        >
                            Confirm & Book Now
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
