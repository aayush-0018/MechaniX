"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signIn } from "next-auth/react"
import { FcGoogle } from "react-icons/fc"
import { MapPin, Settings } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Home() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loadingLocation, setLoadingLocation] = useState(false)

  const handleClick = () => {
    setLoadingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        router.push(`/plumber?lat=${lat}&lng=${lng}`)
      },
      (error) => {
        console.error("Geolocation error:", error)
        alert("Please allow location access to continue.")
        setLoadingLocation(false)
      }
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl w-full items-center">

        {/* Left - Mechanic Section */}
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-3">Find Nearby Mechanics</h1>
            <p className="text-slate-600 max-w-lg text-base md:text-lg">
              Trusted professionals ready to repair and maintain your vehicles.
            </p>
          </div>

          <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
            <CardContent className="p-0">
              <Button
                variant="ghost"
                className="w-full h-full p-0 block overflow-hidden"
                onClick={handleClick}
                disabled={loadingLocation}
              >
                <div className="bg-slate-800 group-hover:bg-emerald-600 transition-colors duration-300 p-6 flex justify-center">
                  <div className="bg-white rounded-full p-3 text-slate-800">
                    <Settings className="h-6 w-6" />
                  </div>
                </div>
                <div className="p-6 text-left">
                  <h3 className="text-xl font-semibold mb-2 text-slate-800">Mechanic</h3>
                  <p className="text-slate-600 text-sm">
                    Diagnose, repair, and maintain your vehicles with trusted professionals.
                  </p>
                  <div className="mt-4 flex items-center text-emerald-600 text-sm font-medium">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{loadingLocation ? "Detecting location..." : "Find nearby"}</span>
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>

          <p className="text-sm text-slate-500">We use your location to suggest nearby workers.</p>
        </div>

        {/* Right Section */}
        <div className="w-full flex flex-col items-center justify-center">
          {status !== "loading" && !session?.user ? (
            <Card className="w-full max-w-sm shadow-md bg-white dark:bg-gray-800 border-none">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-center text-slate-800 dark:text-white mb-6">Login to Continue</h2>
                <Button
                  onClick={() => signIn("google", { callbackUrl: "/onboard" })}
                  className="w-full flex items-center justify-center gap-2 bg-white text-gray-800 border hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                  variant="outline"
                >
                  <FcGoogle size={22} />
                  Sign in with Google
                </Button>
              </CardContent>
            </Card>
          ) : (
            <img
              src="/icons/mechanic.jpg"
              alt="Mechanic Illustration"
              className="w-full max-w-sm rounded-lg shadow-md"
            />
          )}
        </div>
      </div>
    </main>
  )
}
