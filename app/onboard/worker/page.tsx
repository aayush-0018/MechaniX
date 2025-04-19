"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"

const skillsList = [
    "Mechanic",
    "Engine Diagnostics",
    "Brake System Repair",
    "Suspension & Steering Expertise",
    "Electrical Systems Knowledge"
]

export default function WorkerOnboardPage() {
    const { data: session } = useSession()
    const router = useRouter()

    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [skills, setSkills] = useState<string[]>([])
    const [isAvailable, setIsAvailable] = useState(true)
    const [location, setLocation] = useState("")
    const [latitude, setLatitude] = useState<number | null>(null)
    const [longitude, setLongitude] = useState<number | null>(null)
    const [manualLocation, setManualLocation] = useState(false)

    useEffect(() => {
        if (session?.user) {
            setName(session.user.name || "")
        }

        if (!manualLocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLatitude(position.coords.latitude)
                    setLongitude(position.coords.longitude)
                    setLocation(`${position.coords.latitude}, ${position.coords.longitude}`)
                },
                (error) => {
                    console.error("Geolocation error:", error)
                    alert("Please allow location access to autofill coordinates.")
                }
            )
        }
    }, [session, manualLocation])

    const handleSubmit = async () => {
        if (!skills.length) {
            alert("Please select at least one skill")
            return
        }

        try {
            const res = await fetch("/api/onboard", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    phone,
                    skills,
                    isAvailable,
                    latitude,
                    longitude,
                }),
            })

            if (res.ok) {
                router.push("/worker/incoming-request")
            } else {
                alert("Failed to update worker details.")
            }
        } catch (err) {
            console.error(err)
            alert("Something went wrong.")
        }
    }

    const toggleSkill = (skill: string) => {
        setSkills((prev) =>
            prev.includes(skill)
                ? prev.filter((s) => s !== skill)
                : [...prev, skill]
        )
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center py-10 px-4">
            <Card className="w-full max-w-2xl shadow-2xl rounded-2xl border border-gray-300 bg-white">
                <CardContent className="p-8">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
                        Worker Onboarding
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <Label htmlFor="name" className="text-base font-semibold text-gray-700">Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-2 focus:ring-black"
                            />
                        </div>

                        <div>
                            <Label htmlFor="phone" className="text-base font-semibold text-gray-700">Phone (optional)</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="mt-2 focus:ring-black"
                            />
                        </div>

                        <div>
                            <Label className="text-base font-semibold text-gray-700">Skills</Label>
                            <div className="flex flex-wrap gap-3 mt-3">
                                {skillsList.map((skill) => {
                                    const isSelected = skills.includes(skill)
                                    const buttonClasses = `px-4 py-2 rounded-full text-sm font-medium border transition ${isSelected
                                        ? "bg-black text-white border-black"
                                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-200"
                                        }`
                                    return (
                                        <button
                                            key={skill}
                                            type="button"
                                            onClick={() => toggleSkill(skill)}
                                            className={buttonClasses}
                                        >
                                            {skill}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <Label className="text-base font-semibold text-gray-700">Available for Work?</Label>
                            <Switch
                                checked={isAvailable}
                                onCheckedChange={setIsAvailable}
                                className="bg-black"
                            />
                        </div>

                        <div>
                            <Label className="text-base font-semibold text-gray-700">Location (auto)</Label>
                            <Input
                                value={location}
                                disabled
                                className="mt-2"
                            />
                        </div>

                        <div className="flex items-center space-x-3 mt-4">
                            <Label className="text-base font-semibold text-gray-700">Manually input location</Label>
                            <Switch
                                checked={manualLocation}
                                onCheckedChange={setManualLocation}
                                className="bg-black"
                            />
                        </div>

                        {manualLocation && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <Label htmlFor="latitude" className="text-base font-semibold text-gray-700">Latitude</Label>
                                    <Input
                                        id="latitude"
                                        type="number"
                                        value={latitude || ""}
                                        onChange={(e) => setLatitude(parseFloat(e.target.value))}
                                        className="mt-2 focus:ring-black"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="longitude" className="text-base font-semibold text-gray-700">Longitude</Label>
                                    <Input
                                        id="longitude"
                                        type="number"
                                        value={longitude || ""}
                                        onChange={(e) => setLongitude(parseFloat(e.target.value))}
                                        className="mt-2 focus:ring-black"
                                    />
                                </div>
                            </div>
                        )}

                        <Button
                            onClick={handleSubmit}
                            className="mt-8 w-full py-3 text-lg bg-black hover:bg-gray-900 text-white rounded-xl"
                        >
                            Complete Onboarding
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}
