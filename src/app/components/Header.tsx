"use client";

import { useState } from "react";
import { Heading, Flex, Text, Switch } from "@radix-ui/themes";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header({ onToggleUnit, isCelsius }: { onToggleUnit: () => void; isCelsius: boolean }) {
    const pathname = usePathname();

    return (
        <header className="header">
            <Flex justify="between" align="center" p="4">
                <Heading size="6" className="header-title">
                    <Link href="/">Hong Kong Weather</Link>
                </Heading>
                <Flex align="center" gap="6">
                    <nav className="header-nav">
                        {[
                            { href: "/", label: "Home" },
                            { href: "/forecast", label: "Forecast" },
                            { href: "/about", label: "About" },
                        ].map(({ href, label }) => (
                            <Link
                                key={href}
                                href={href}
                                className={`header-link ${pathname === href ? "header-link-active" : ""}`}
                            >
                                {label}
                            </Link>
                        ))}
                    </nav>
                    <Flex align="center" gap="3">
                        <Text size="3" className="header-toggle-label">
                            {isCelsius ? "Celsius" : "Fahrenheit"}
                        </Text>
                        <Switch
                            checked={isCelsius}
                            onCheckedChange={onToggleUnit}
                            className="header-toggle"
                        />
                    </Flex>
                </Flex>
            </Flex>
        </header>
    );
}