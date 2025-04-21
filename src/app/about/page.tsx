"use client";

// Client-side component for the About page
import React, { useState } from "react";
import { Heading, Text, Button, Flex, Tooltip } from "@radix-ui/themes";
import { Sun, Moon, Thermometer, Umbrella, MapPin, Calendar } from "lucide-react";

export default function AboutPage() {
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    const getTextBoxClass = () => (isDarkMode ? "text-box-dark" : "text-box");

    return (
        <div className={`about-page bg-default ${isDarkMode ? "dark-mode" : "light-mode"}`}>

            {/* Cloud Logo */}
            <div className="cloud-logo">
                <svg viewBox="0 -100 100 60" className="cloud-logo-svg">
                    <path className="cloud-base" d="M80 30a20 20 0 0 0-40 0 15 15 0 0 0-10 28h60a15 15 0 0 0-10-28z" />
                    <path className="cloud-puff-1" d="M50 25a8 8 0 0 1 8 8 8 8 0 0 1-8 8 8 8 0 0 1-8-8 8 8 0 0 1 8-8z" />
                    <path className="cloud-puff-2" d="M65 28a7 7 0 0 1 7 7 7 7 0 0 1-7 7 7 7 0 0 1-7-7 7 7 0 0 1 7-7z" />
                </svg>
            </div>

            {/* Cloud Animations */}
            <div className="cloud-effect">
                <svg className="cloud cloud-left" viewBox="0 0 64 64">
                    <path d="M46 24a14 14 0 0 0-26 0 10 10 0 0 0-6 18h38a10 10 0 0 0-6-18z" fill="#6b7280" />
                </svg>
                <svg className="cloud cloud-right" viewBox="0 0 64 64">
                    <path d="M46 24a14 14 0 0 0-26 0 10 10 0 0 0-6 18h38a10 10 0 0 0-6-18z" fill="#6b7280" />
                </svg>
            </div>

            <Flex direction="column" gap="8" p={{ initial: "4", md: "8" }} align="center" className="about-container">
                {/* Header */}
                <div className={`welcome-header ${getTextBoxClass()}`}>
                    <Flex justify="between" align="center" width="100%" mb="4">
                        <Heading size="8" className="welcome-title">
                            About the Hong Kong Weather Dashboard
                        </Heading>
                        <Tooltip content={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                            <Button variant="ghost" onClick={toggleTheme} className="theme-toggle">
                                {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
                            </Button>
                        </Tooltip>
                    </Flex>
                    <Text size="4" className="welcome-subtitle">
                        Learn about our mission to provide accurate and accessible weather updates for Hong Kong.
                    </Text>
                </div>

                {/* About Section */}
                <div className={`about-section ${getTextBoxClass()}`}>
                    <Heading size="6" mb="4">
                        Our Mission
                    </Heading>
                    <Text size="4" className="description">
                        The Hong Kong Weather Dashboard is designed to empower residents and visitors with real-time, district-specific weather information. Whether you’re planning your day or preparing for changing conditions, our dashboard delivers accurate updates, intuitive visuals, and a user-friendly experience tailored to Hong Kong’s dynamic climate.
                    </Text>
                </div>

                {/* Features Section */}
                <div className={`features-section ${getTextBoxClass()}`}>
                    <Heading size="6" mb="4">
                        Key Features
                    </Heading>
                    <Text size="3" mb="6" className="description">
                        Discover what makes our dashboard stand out.
                    </Text>
                    <Flex
                        direction={{ initial: "column", md: "row" }}
                        gap="4"
                        justify="start"
                        wrap="wrap"
                        className="feature-grid"
                    >
                        <div className="feature-card">
                            <Flex gap="2" align="center" mb="2">
                                <Thermometer className="feature-icon" />
                                <Text size="4" weight="bold">Real-Time Temperature</Text>
                            </Flex>
                            <Text size="3">Get up-to-date temperature readings for your selected district, with options to view in Celsius or Fahrenheit.</Text>
                        </div>
                        <div className="feature-card">
                            <Flex gap="2" align="center" mb="2">
                                <Umbrella className="feature-icon" />
                                <Text size="4" weight="bold">Rain Probability</Text>
                            </Flex>
                            <Text size="3">Stay prepared with accurate rain chance forecasts for the next 9 days.</Text>
                        </div>
                        <div className="feature-card">
                            <Flex gap="2" align="center" mb="2">
                                <MapPin className="feature-icon" />
                                <Text size="4" weight="bold">District-Specific Data</Text>
                            </Flex>
                            <Text size="3">Choose your district to access localized weather updates and forecasts.</Text>
                        </div>
                        <div className="feature-card">
                            <Flex gap="2" align="center" mb="2">
                                <Calendar className="feature-icon" />
                                <Text size="4" weight="bold">Interactive Forecasts</Text>
                            </Flex>
                            <Text size="3">Explore temperature trends and weather conditions with our interactive 9-day forecast chart.</Text>
                        </div>
                    </Flex>
                </div>

                {/* Credits Section */}
                <div className={`credits-section ${getTextBoxClass()}`}>
                    <Heading size="6" mb="4">
                        Credits & Thanks
                    </Heading>
                    <Text size="4" className="description">
                        We rely on data from the <strong>Hong Kong Observatory</strong> to deliver accurate and timely weather updates. Special thanks to our dedicated team of developers and designers who brought this dashboard to life.
                    </Text>
                </div>

            </Flex>
        </div>
    );
}