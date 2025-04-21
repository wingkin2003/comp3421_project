"use client";

import { Heading, Flex } from "@radix-ui/themes";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
    const pathname = usePathname();

    return (
        <header className="header">
            <Flex justify="between" align="center">
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
                </Flex>
            </Flex>
        </header>
    );
}