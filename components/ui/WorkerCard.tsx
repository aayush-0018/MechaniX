import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";

interface Worker {
    id: string;
    name: string;
    image?: string;
    isAvailable: boolean;
    skills: string[];
    location?: string;
    distance: number;
}

export default function WorkerCard({ worker, lat, lng }: { worker: Worker, lat: string, lng: string }) {
    return (
        <Link href={`/plumber/view-page/${worker.id}/?lat=${lat}&lng=${lng}`}>
            <Card className="rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Image
                            src={worker.image || "/default-avatar.png"}
                            alt={worker.name}
                            width={60}
                            height={60}
                            className="rounded-full object-cover"
                        />
                        <div>
                            <CardTitle className="text-lg">{worker.name}</CardTitle>
                            {/* <p className="text-sm text-muted-foreground">
                                {worker.location || "Location not available"}
                            </p> */}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                        {worker.skills.map((skill) => (
                            <Badge key={skill} variant="default" className="capitalize">
                                {skill}
                            </Badge>
                        ))}
                    </div>
                    <div className="text-sm text-gray-700">
                        <strong>Distance:</strong> {worker.distance} km
                    </div>
                    <div className="text-sm">
                        <span
                            className={`font-semibold ${worker.isAvailable ? "text-green-600" : "text-red-500"
                                }`}
                        >
                            {worker.isAvailable ? "Available" : "Unavailable"}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
