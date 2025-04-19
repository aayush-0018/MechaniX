'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner'; // Import the toast function

interface Worker {
    id?: string;
    name?: string;
    skill?: string[];
    phone?: string;
    image?: string;
    rating?: number;
}

export default function WorkStatusPage() {
    const { data: session } = useSession();
    const router = useRouter(); // Initialize router
    const searchParams = useSearchParams();
    const workerId = searchParams.get('workerId');
    const [worker, setWorker] = useState<Worker>({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rating, setRating] = useState<number | null>(null);
    const [hoveredStar, setHoveredStar] = useState<number | null>(null);
    const [comment, setComment] = useState('');

    useEffect(() => {
        if (!workerId) return;

        const fetchWorker = async () => {
            try {
                const res = await fetch(`/api/workers/${workerId}`);
                const data = await res.json();
                setWorker(data);
            } catch (err) {
                console.error('Error fetching worker:', err);
            }
        };

        fetchWorker();
    }, [workerId]);

    const handleCompleteWork = async () => {
        const bookingId = searchParams.get('bookingId');
        if (!workerId || !bookingId) return;

        try {
            await fetch(`/api/workers/${workerId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isAvailable: true }),
            });

            await fetch(`/api/bookings/${bookingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'completed' }),
            });

            setIsModalOpen(true);
        } catch (err) {
            console.error('Error completing work:', err);
            toast.error('Failed to complete work. Please try again.');
        }
    };

    const handleSubmitReview = async () => {
        if (!session?.user?.id || !workerId || !rating) return;

        try {
            const bookingId = searchParams.get('bookingId');
            await fetch('/api/reviews/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rating,
                    comment,
                    workerId,
                    customerId: session.user.id,
                    bookingId,
                }),
            });

            toast.success('Review submitted! Thank you for using our service');
            // setIsModalOpen(false);
            router.push('/'); // Redirect to homepage
        } catch (err) {
            console.error('Failed to submit review:', err);
            toast.error('Error submitting review');
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
                🛠 Worker is currently working...
            </h2>

            <Button onClick={handleCompleteWork} className="px-6 py-3 text-lg bg-green-600 hover:bg-green-700">
                Mark Work as Completed
            </Button>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Leave a Review</DialogTitle>
                        <DialogDescription className="text-base">
                            Share your experience with <span className="font-semibold">{worker?.name}</span>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 pt-4">
                        {/* Star Rating UI */}
                        <div>
                            <p className="font-medium mb-2">⭐ Rating</p>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={30}
                                        className={`cursor-pointer transition-colors ${(hoveredStar ?? rating ?? 0) >= star
                                            ? 'fill-yellow-400 stroke-yellow-500'
                                            : 'stroke-gray-400'
                                            }`}
                                        onMouseEnter={() => setHoveredStar(star)}
                                        onMouseLeave={() => setHoveredStar(null)}
                                        onClick={() => setRating(star)}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block font-medium">📝 Comment</label>
                            <Textarea
                                rows={4}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Write something about the service..."
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmitReview}
                                disabled={rating === null}
                            >
                                Submit Review
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
