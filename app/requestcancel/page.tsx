'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export default function RequestCancelPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const skill = searchParams.get('skill') || 'plumber'; // fallback

    useEffect(() => {
        toast.error('Request was cancelled by the worker.');
        const timeout = setTimeout(() => {
            router.push(`/${skill}`);
        }, 5000);

        return () => clearTimeout(timeout);
    }, [router, skill]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 dark:bg-black px-4">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
                <h1 className="text-3xl font-bold mb-4 text-red-600">❌ Request Cancelled</h1>
                <p className="text-muted-foreground mb-6">
                    The worker was unable to accept your booking. You’ll be redirected shortly, or you can go back manually.
                </p>
                <Button onClick={() => router.push(`/${skill}`)}>🔙 Back to {skill.charAt(0).toUpperCase() + skill.slice(1)} List</Button>
            </div>
        </div>
    );
}
