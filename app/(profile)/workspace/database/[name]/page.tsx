"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, User2, Server, Globe, Eye, EyeOff, ArrowLeft, Zap } from 'lucide-react';
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';
import { useGetDatabaseServicesQuery } from "@/redux/api/projectApi";
import Lottie from "lottie-react";
import LoadingMissile from "@/public/LoadingMissile.json";
import Breadcrumbs from '@/components/Breadcrumb2';
import Loading from '@/components/Loading';
import {DatabaseDeploymentResponse} from "@/components/profiledashboard/workspace/service/Service";

interface DatabaseDetailProps {
    params: Promise<{
        name: string;
    }>;
}

export default function DatabaseDetail({ params }: DatabaseDetailProps) {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);

    // Unwrap the params Promise using React.use()
    const { name } = React.use(params);

    // Get the workspace name from localStorage
    const selectedWorkspace = typeof window !== 'undefined'
        ? localStorage.getItem("selectedWorkspace") || ""
        : "";

    const { data: databaseData, isLoading } = useGetDatabaseServicesQuery({
        workspaceName: selectedWorkspace,
        size: 50,
        page: 0,
    }) as unknown as { data: DatabaseDeploymentResponse, isLoading: boolean };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-2">
                    <Lottie
                        animationData={LoadingMissile}
                        loop={true}
                        style={{ width: 64, height: 64 }}
                    />
                    <Loading />
                </div>
            </div>
        );
    }

    const database = databaseData?.results.find((db: { dbName: string; }) => db.dbName === name);

    if (!database) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">
                    Database not found
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    The database &quot;{name}&quot; does not exist.
                </p>
                <Button
                    onClick={() => router.back()}
                    variant="outline"
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Go Back
                </Button>
            </div>
        );
    }

    const connectionString = `${database.subdomain}.database.cloudinator.cloud:${database.port}`;

    return (
        <div className="px-8 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >

                <Breadcrumbs />

                <Card className="bg-white dark:bg-gray-800 shadow-lg mt-6 border border-gray-200 dark:border-gray-700">
                    <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Database className="w-8 h-8 text-purple-500" />
                                <CardTitle className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {database.dbName}
                                </CardTitle>
                            </div>
                            <Badge
                                variant="outline"
                                className="bg-green-100 text-green-700 border-green-200 animate-pulse flex items-center gap-1"
                            >
                                <Zap className="w-4 h-4" />
                                Active
                            </Badge>
                        </div>
                    </CardHeader>

                    <CardContent className="mt-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-4">
                                    Database Information
                                </h3>

                                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/10 dark:bg-gray-800/20 backdrop-blur-md border border-white/20 dark:border-gray-700/30 shadow-[0_0_10px_rgba(192,132,252,0.2)] hover:shadow-[0_0_15px_rgba(192,132,252,0.3)] transition-shadow">
                                    <Database className="w-8 h-8 text-purple-400 dark:text-purple-300" />
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Database Name</p>
                                        <p className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                                            {database.dbName}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/10 dark:bg-gray-800/20 backdrop-blur-md border border-white/20 dark:border-gray-700/30 shadow-[0_0_10px_rgba(192,132,252,0.2)] hover:shadow-[0_0_15px_rgba(192,132,252,0.3)] transition-shadow">
                                    <User2 className="w-8 h-8 text-purple-400 dark:text-purple-300" />
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Database Username</p>
                                        <p className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                                            {database.name}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/10 dark:bg-gray-800/20 backdrop-blur-md border border-white/20 dark:border-gray-700/30 shadow-[0_0_10px_rgba(192,132,252,0.2)] hover:shadow-[0_0_15px_rgba(192,132,252,0.3)] transition-shadow">
                                    <Server className="w-8 h-8 text-purple-400 dark:text-purple-300" />
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Port</p>
                                        <p className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                                            {database.port}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-4">
                                    Connection Details
                                </h3>

                                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/10 dark:bg-gray-800/20 backdrop-blur-md border border-white/20 dark:border-gray-700/30 shadow-[0_0_10px_rgba(192,132,252,0.2)] hover:shadow-[0_0_15px_rgba(192,132,252,0.3)] transition-shadow">
                                    <Globe className="w-8 h-8 text-purple-400 dark:text-purple-300" />
                                    <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Host</p>
                                        <p className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                                            {database.subdomain}.database.cloudinator.cloud
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/10 dark:bg-gray-800/20 backdrop-blur-md border border-white/20 dark:border-gray-700/30 shadow-[0_0_10px_rgba(192,132,252,0.2)] hover:shadow-[0_0_15px_rgba(192,132,252,0.3)] transition-shadow">
                                    <Eye className="w-8 h-8 text-purple-400 dark:text-purple-300" />
                                    <div className="flex-grow">
                                        <p className="text-sm text-gray-600 dark:text-gray-300">Password</p>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                                                {showPassword ? database.password : "••••••••"}
                                            </p>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="text-purple-400 hover:text-purple-300"
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="w-4 h-4" />
                                                ) : (
                                                    <Eye className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/20 dark:border-gray-700/30">
                            <h3 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-4">
                                Connection String
                            </h3>
                            <div className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-md p-4 rounded-lg border border-white/20 dark:border-gray-700/30 shadow-[0_0_10px_rgba(192,132,252,0.2)] hover:shadow-[0_0_15px_rgba(192,132,252,0.3)] transition-shadow">
                                <code className="text-sm text-gray-800 dark:text-gray-200">
                                    {connectionString}
                                </code>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}