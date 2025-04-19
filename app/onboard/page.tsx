"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function SignInPage() {
    const router = useRouter()
    const [role, setRole] = useState<"user" | "worker" | null>(null)

    const handleRedirect = (selectedRole: "user" | "worker") => {
        setRole(selectedRole)
        const redirectPath = selectedRole === "worker" ? "/onboard/worker" : "/"
        router.push(redirectPath)
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-4 py-10">
            <div className="w-full max-w-sm">
                <Card className="shadow-lg border-none">
                    <CardContent className="p-6 space-y-6">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-slate-800 mb-1">Sign in</h1>
                            <p className="text-slate-500 text-sm">Continue as a User or Worker</p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <Button
                                variant="default"
                                className="w-full"
                                onClick={() => handleRedirect("user")}
                            >
                                Sign in as User
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => handleRedirect("worker")}
                            >
                                Sign in as Worker
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
