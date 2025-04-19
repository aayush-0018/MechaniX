'use client';

import { signIn } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { FcGoogle } from "react-icons/fc";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const { data: session } = useSession();
    const router = useRouter(); 

    useEffect(() => {
        if (session) {
            router.push('/');
        }
    }, [session]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-6">
            <Card className="w-full max-w-md shadow-xl bg-white dark:bg-gray-800 border dark:border-gray-700">
                <CardHeader className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">Sign in to continue</p>
                </CardHeader>
                <CardContent>
                    <Button
                        onClick={() => signIn('google')}
                        className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 border hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                        variant="outline"
                    >
                        <FcGoogle size={24} />
                        Sign in with Google
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
