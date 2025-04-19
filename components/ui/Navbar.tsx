"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import AuthButton from "@/components/ui/AuthButton";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Navbar() {
    const { data: session } = useSession();
    const user = session?.user;
    console.log(user);


    return (
        <nav className="bg-zinc-900 text-white px-6 py-3 flex items-center justify-between shadow-md">
            <Link href="/" className="text-xl font-bold text-white">
                MechaniX
            </Link>

            <div className="flex items-center space-x-4">
                <Link href="/bookings">
                    <Button variant="secondary">Bookings</Button>
                </Link>

                {user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <div className="cursor-pointer flex items-center space-x-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.image ?? ""} alt={user.name ?? "User"} />
                                    <AvatarFallback>{user.name?.[0] ?? "U"}</AvatarFallback>
                                </Avatar>
                                <span className="hidden sm:block text-sm">{user.name}</span>
                            </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48" align="end">
                            {/* <DropdownMenuItem disabled>Signed in as<br /><strong>{user.email}</strong></DropdownMenuItem> */}
                            <DropdownMenuSeparator />
                            {/* <DropdownMenuItem>
                                <Link href="/profile" className="w-full">Profile</Link>
                            </DropdownMenuItem> */}
                            <DropdownMenuItem onClick={() => signOut()}>
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <AuthButton />
                )}
            </div>
        </nav>
    );
}
