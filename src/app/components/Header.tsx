"use client";

import { useState } from "react";
import { Heading, Switch, Flex, Text } from "@radix-ui/themes";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
    const pathname = usePathname();
    const [alertsEnabled, setAlertsEnabled] = useState(false);

    return (
        <header className="flex justify-between items-center p-6 bg-gradient-to-r from-blue-800 to-blue-950 text-white shadow-xl">
            <Heading size="6" className="hover:text-blue-200 transition-colors drop-shadow-md">
                <Link href="/">Hong Kong Weather</Link>
            </Heading>
            <Flex align="center" gap="8">
                <nav className="flex gap-6">
                    {[
                        { href: "/", label: "Home" },
                        { href: "/create-task", label: "Create Task" },
                    ].map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`text-lg hover:text-blue-200 transition-colors ${pathname === href ? "text-blue-200 underline underline-offset-4" : "text-white"
                                }`}
                        >
                            {label}
                        </Link>
                    ))}
                </nav>
                <Flex align="center" gap="3">
                    <Text size="3" className="text-white font-medium">
                        Weather Alerts
                    </Text>
                    <Switch
                        checked={alertsEnabled}
                        onCheckedChange={setAlertsEnabled}
                        className="cursor-pointer"
                    />
                </Flex>
            </Flex>
        </header>
    );
}