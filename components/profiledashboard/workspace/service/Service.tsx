"use client";

import Link from "next/link";
import styles from "./Service.module.css";
import React, { useState, useEffect, lazy, Suspense, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Database,
    Layout,
    MoreVertical,
    Server,
    Share2,
    User2,
    Plus,
    Search,
    GitBranch,
    Globe,
    ExternalLink,
    Folder,
    Zap,
    PowerOff,
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import {
    useDeleteServiceDeploymentMutation,
    useDeleteSubWorkSpaceMutation,
    useGetDatabaseServicesQuery,
    useGetServiceDeploymentQuery,
    useGetSubWorkspacesQuery,
    useGetWorkspacesQuery,
} from "@/redux/api/projectApi";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
// import Loading from "@/components/Loading";
import { Badge } from "@/components/ui/badge";
import Lottie from "lottie-react";
import LoadingMissile from "@/public/LoadingMissile.json";

const CreateProjectContent = lazy(
    () => import("@/components/profiledashboard/workspace/CreateProjectContent")
);

type ServiceType = {
    name: string;
    gitUrl: string;
    branch: string;
    subdomain: string;
    status: boolean;
    type: "all" | "frontend" | "backend" | "database" | "subworkspace";
    createdAt: string;
    updatedAt: string;
    port: string;
    password: string;
    username: string;
    dbType: string;
    dbVersion: string;
    buildStatus?: string;
};

export type ServiceDeploymentResponse = {
    next: boolean;
    previous: boolean;
    total: number;
    totalElements: number;
    results: ServiceType[];
};

type SubWorkspaceType = {
    name: string;
    type: "subworkspace";
    uuid: string;
    gitUrl: string;
    branch: string;
    subdomain: string;
    status: boolean;
    createdAt: string;
    updatedAt: string;
};

type SubWorkSpaceResponse = {
    next: boolean;
    previous: boolean;
    total: number;
    totalElements: number;
    results: SubWorkspaceType[];
};

type DatabaseType = {
    uuid: string;
    dbName: string;
    username: string;
    password: string;
    dbType: string;
    dbVersion: string;
    port: string;
    type: "database";
    status: boolean;
    createdAt: string;
    updatedAt: string;
    name: string;
    gitUrl: string;
    subdomain: string;
};

export type DatabaseDeploymentResponse = {
    next: boolean;
    previous: boolean;
    total: number;
    totalElements: number;
    results: DatabaseType[];
};

interface ErrorResponse {
    status?: string;
    originalStatus?: number;
    data?: {
        message?: string;
    };
}

function getServiceIcon(type: ServiceType["type"]) {
    switch (type) {
        case "all":
            return <Folder className="w-5 h-5 text-yellow-500" />;
        case "frontend":
            return <Layout className="w-5 h-5 text-purple-600" />;
        case "backend":
            return <Server className="w-5 h-5 text-pink-600" />;
        case "database":
            return <Database className="w-5 h-5 text-orange-600" />;
        case "subworkspace":
            return <Share2 className="w-5 h-5 text-blue-600" />;
    }
}

export default function Service() {
    const router = useRouter();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredServices, setFilteredServices] = useState<(ServiceType | SubWorkspaceType | DatabaseType)[]>([]);
    const [selectedType, setSelectedType] = useState<ServiceType["type"] | "all">(
        "all"
    );
    const [deleteServiceDeployment] = useDeleteServiceDeploymentMutation();
    const [deleteSubWorkspace] = useDeleteSubWorkSpaceMutation();

    const { toast } = useToast();

    const { data: workspacesData } = useGetWorkspacesQuery();
    const workspaces = workspacesData || [];


    const [selectedWorkspace, setSelectedWorkspace] = useState(() => {
        if (typeof window !== "undefined") {
            const savedWorkspace = localStorage.getItem("selectedWorkspace");
            return (
                savedWorkspace || (workspaces.length > 0 ? workspaces[0].name : "")
            );
        }
        return workspaces.length > 0 ? workspaces[0].name : "";
    });

    useEffect(() => {
        if (workspaces && workspaces.length === 1) {
            // Automatically select the only workspace available
            setSelectedWorkspace(workspaces[0].name);
        }
    }, [workspaces]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("selectedWorkspace", selectedWorkspace);
        }
    }, [selectedWorkspace]);

    const { data: servicesData, refetch: data1 } = useGetServiceDeploymentQuery({
        workspaceName: selectedWorkspace,
        size: 50,
        page: 0,
    }) as unknown as { data: ServiceDeploymentResponse; refetch: () => void };

    const { data: subWorkspace, refetch: data2 } = useGetSubWorkspacesQuery({
        workspaceName: selectedWorkspace,
        size: 50,
        page: 0,
    }) as unknown as { data: SubWorkSpaceResponse; refetch: () => void };

    const { data: databaseData, refetch: data3 } = useGetDatabaseServicesQuery({
        workspaceName: selectedWorkspace,
        size: 50,
        page: 0,
    }) as unknown as { data: DatabaseDeploymentResponse; refetch: () => void };

    console.log("databaseData", databaseData);

    const combinedResults = useMemo(() => {
        const services = servicesData?.results || [];
        const subWorkspaces = subWorkspace?.results || [];
        const databases = databaseData?.results || [];

        const processedServices = services.map((service) => ({
            ...service,
            updatedAt: service.updatedAt || new Date().toISOString(),
        }));

        const processedSubWorkspaces = subWorkspaces.map((subWorkspace) => ({
            ...subWorkspace,
            updatedAt: subWorkspace.updatedAt || new Date().toISOString(),
        }));

        const processedDatabases = databases.map((database) => ({
            ...database,
            name: database.dbName,
            updatedAt: new Date().toISOString(),
            type: "database" as const,
            status: true,
        }));

        return [...processedServices, ...processedSubWorkspaces, ...processedDatabases].sort((a, b) => {
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
    }, [servicesData, subWorkspace, databaseData]);

    const getLocalStorageKey = (projectName: string) => `project_${projectName}_createdAt`;

    const storeCreationTime = (projectName: string, createdAt: string) => {
        const key = getLocalStorageKey(projectName);
        if (!localStorage.getItem(key)) {
            localStorage.setItem(key, createdAt);
        }
    };

    const isProjectNew = (projectName: string) => {
        const key = getLocalStorageKey(projectName);
        const createdAt = localStorage.getItem(key);
        if (!createdAt) {
            return false;
        }

        const creationTime = new Date(createdAt).getTime();
        const currentTime = new Date().getTime();
        return currentTime - creationTime < 24 * 60 * 60 * 1000;
    };

    useEffect(() => {
        if (combinedResults) {
            combinedResults.forEach((service) => {
                storeCreationTime(service.name, service.createdAt);
            });
        }
    }, [combinedResults]);

    useEffect(() => {
        if (combinedResults) {
            let filtered = [...combinedResults];

            // Filter by type
            if (selectedType !== "all") {
                filtered = filtered.filter((service) => {
                    if (service.type === "database") {
                        return selectedType === "database";
                    } else if (service.type === "subworkspace") {
                        return selectedType === "subworkspace";
                    } else {
                        // For frontend and backend services
                        return service.type === selectedType;
                    }
                });
            }

            // Filter by search term
            if (searchTerm) {
                filtered = filtered.filter((service) => {
                    const searchField = service.type === "database" ? service.name : service.name;
                    return searchField.toLowerCase().includes(searchTerm.toLowerCase());
                });
            }

            setFilteredServices(filtered);
        }
    }, [combinedResults, searchTerm, selectedType]);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState<ServiceType | null>(
        null
    );
    const [subWorkspaceToDelete, setSubWorkspaceToDelete] =
        useState<SubWorkspaceType | null>(null);
    const [databaseToDelete, setDatabaseToDelete] = useState<DatabaseType | null>(null);
    const [deleteConfirmationName, setDeleteConfirmationName] = useState("");

    const cleanupOldProjects = () => {
        const currentTime = new Date().getTime();
        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith("project_") && key.endsWith("_createdAt")) {
                const createdAt = localStorage.getItem(key);
                if (createdAt) {
                    const creationTime = new Date(createdAt).getTime();
                    if (currentTime - creationTime >= 24 * 60 * 60 * 1000) {
                        localStorage.removeItem(key);
                    }
                }
            }
        });
    };

    useEffect(() => {
        cleanupOldProjects();
    }, []);

    const handleDeleteClick = (service: ServiceType | SubWorkspaceType | DatabaseType) => {
        if (service.type === "subworkspace") {
            setSubWorkspaceToDelete(service as SubWorkspaceType);
        } else if (service.type === "database") {
            setDatabaseToDelete(service as DatabaseType);
        } else {
            setServiceToDelete(service as ServiceType);
        }
        setIsDeleteModalOpen(true);
        setDeleteConfirmationName("");
    };

    const confirmDelete = async () => {
        if (serviceToDelete && deleteConfirmationName === serviceToDelete.name) {
            try {
                const result = await deleteServiceDeployment({ name: serviceToDelete.name }).unwrap();

                toast({
                    title: "Success",
                    description: `Service "${serviceToDelete.name}" has been deleted successfully.`,
                    variant: "success",
                    duration: 3000,
                });

                console.log("Service deployment deleted:", result);

                data1();
                data2();
                data3();
            } catch (err) {
                const error = err as ErrorResponse;

                console.log("Failed to delete service deployment:", error);

                if (error?.status === "PARSING_ERROR" && error?.originalStatus === 200) {
                    toast({
                        title: "Success",
                        description:
                            error?.data?.message ||
                            `Service "${serviceToDelete.name}" has been deleted successfully.`,
                        variant: "success",
                        duration: 3000,
                    });

                    data1();
                    data2();
                    data3();
                } else {
                    toast({
                        title: "Error",
                        description:
                            error?.data?.message ||
                            "Failed to delete service. Please try again.",
                        variant: "error",
                        duration: 5000,
                    });
                }
            } finally {
                setIsDeleteModalOpen(false);
                setServiceToDelete(null);
                setDeleteConfirmationName("");
            }
        }
    };

    const confirmDeleteSubWorkspace = async () => {
        if (
            subWorkspaceToDelete &&
            deleteConfirmationName === subWorkspaceToDelete.name
        ) {
            try {
                await deleteSubWorkspace({ name: subWorkspaceToDelete.name }).unwrap();

                toast({
                    title: "Success",
                    description: `Subworkspace "${subWorkspaceToDelete.name}" has been deleted successfully.`,
                    variant: "default",
                    duration: 3000,
                });

                data1();
                data2();
                data3();
            } catch (err) {
                const error = err as ErrorResponse;
                toast({
                    title: "Error",
                    description:
                        error?.data?.message ||
                        "Failed to delete subworkspace. Please try again.",
                    variant: "destructive",
                    duration: 5000,
                });
            } finally {
                setIsDeleteModalOpen(false);
                setSubWorkspaceToDelete(null);
                setDeleteConfirmationName("");
            }
        }
    };

    const confirmDeleteDatabase = async () => {
        if (databaseToDelete && deleteConfirmationName === databaseToDelete.dbName) {
            try {
                // Implement the actual deletion logic here
                console.log(`Deleting database: ${databaseToDelete.dbName}`);

                toast({
                    title: "Success",
                    description: `Database "${databaseToDelete.dbName}" has been deleted successfully.`,
                    variant: "success",
                    duration: 3000,
                });

                data1();
                data2();
                data3();
            } catch (err) {
                const error = err as ErrorResponse;
                toast({
                    title: "Error",
                    description:
                        error?.data?.message ||
                        "Failed to delete database. Please try again.",
                    variant: "error",
                    duration: 5000,
                });
            } finally {
                setIsDeleteModalOpen(false);
                setDatabaseToDelete(null);
                setDeleteConfirmationName("");
            }
        }
    };

    const EmptyState = ({
                            type,
                            onCreateProject,
                        }: {
        type: string;
        onCreateProject: () => void;
    }) => {
        return (
            <div
                className="w-full h-[500px] flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700">
                <Folder className="w-12 h-12 text-purple-500 mb-4" />
                <h3 className="text-lg font-semibold text-purple-500 mb-2">
                    No {type} Projects Found
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-300 mb-4">
                    You do not have any {type} projects yet. Create one to get started!
                </p>
                <Button
                    onClick={onCreateProject}
                    className="bg-purple-500 hover:bg-purple-700 text-white w-[300px]"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Create {type} Project
                </Button>
            </div>
        );
    };

    const projectCounts = useMemo(() => {
        const counts = {
            all: combinedResults.length,
            frontend: combinedResults.filter((service) => service.type === "frontend")
                .length,
            backend: combinedResults.filter((service) => service.type === "backend")
                .length,
            database: combinedResults.filter((service) => service.type === "database")
                .length,
            subworkspace: combinedResults.filter((service) => service.type === "subworkspace"
            ).length,
        };
        return counts;
    }, [combinedResults]);

    if (!workspacesData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-2">
                    {/* Replace Loader2 with Lottie animation */}
                    <Lottie
                        animationData={LoadingMissile} // Pass the JSON animation
                        loop={true} // Make the animation loop
                        style={{ width: 64, height: 64 }} // Set the size of the animation
                    />
                    {/* <Loading /> */}
                </div>
            </div>
        );
    }

    return (
        <div className="py-6 px-4 sm:px-6 lg:px-8">

            <div className="flex justify-between items-center w-full bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg shadow-gray-200/20 dark:shadow-purple-500/10">
                {/* Workspace Title */}
                <div className="flex items-center gap-4">
                    <Plus className="w-8 h-8 text-purple-500" />
                    <h1 className="text-purple-500 bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 font-bold text-4xl">
                        Workspace
                    </h1>
                </div>

                {/* Create Project Button */}
                <div className="flex items-center">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center"
                    >
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-purple-500 hover:bg-purple-700 focus:ring-2 focus:ring-purple-700 focus:ring-offset-2">
                                    <Plus className="mr-2 h-5 w-5" />
                                    Create Project
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="p-0 bg-white dark:bg-gray-950 max-w-[90vw] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] w-full h-[90vh] sm:h-auto">
                                <DialogTitle className="sr-only">Create New Project</DialogTitle>
                                <Suspense
                                    fallback={
                                        <div className="flex items-center justify-center h-64">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{
                                                    duration: 1,
                                                    repeat: Infinity,
                                                    ease: "linear",
                                                }}
                                            >
                                                <Database className="w-12 h-12 text-purple-500" />
                                            </motion.div>
                                        </div>
                                    }
                                >
                                    <CreateProjectContent
                                        onClose={() => setIsDialogOpen(false)}
                                        selectedWorkspace={selectedWorkspace}
                                        data1={data1}
                                        data2={data2}
                                    />
                                </Suspense>
                            </DialogContent>
                        </Dialog>
                    </motion.div>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-gradient-to-br mt-6 from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 backdrop-blur-md"
            >
                <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 ">
                    <Select
                        defaultValue={selectedWorkspace}
                        onValueChange={(value) => {
                            setSelectedWorkspace(value);
                        }}
                    >
                        <SelectTrigger className="w-full sm:w-[200px] bg-white dark:bg-gray-700 text-purple-500 dark:text-purple-400 focus:ring-purple-500 border border-gray-300 dark:border-gray-600 hover:border-purple-500 transition-all">
                            <User2 className="mr-2 h-4 w-4 text-purple-500 dark:text-purple-400" />
                            <SelectValue placeholder="Select Workspace" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 text-purple-500 dark:text-purple-400 border border-gray-300 dark:border-gray-700">
                            {workspaces.map((workspace) => (
                                <SelectItem key={workspace.uuid} value={workspace.name} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                                    {workspace.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <div className="relative w-full sm:w-auto flex-grow">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 dark:text-purple-400" />
                        <Input
                            type="text"
                            placeholder="Search Projects..."
                            className="pl-10 w-full bg-white dark:bg-gray-700 text-purple-500 dark:text-purple-400 border border-gray-300 dark:border-gray-600 hover:border-purple-500 focus:border-purple-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="mb-4">
                    <h2 className="text-sm font-bold text-purple-500 dark:text-purple-400">
                        Filter By:
                    </h2>
                </div>
                <div className="flex flex-wrap gap-3">
                    {(
                        ["all", "frontend", "backend", "database", "subworkspace"] as const
                    ).map((type) => (
                        <Button
                            key={type}
                            variant={selectedType === type ? "default" : "outline"}
                            className={`bg-white dark:bg-gray-700 text-purple-500 dark:text-purple-400 capitalize hover:text-purple-700 dark:hover:text-purple-300 hover:bg-gray-100 dark:hover:bg-gray-600 focus:ring-purple-500 border border-gray-300 dark:border-gray-600 transition-all ease-in-out ${selectedType === type ? "ring-2 ring-purple-500 glow" : ""
                            }`}
                            onClick={() => setSelectedType(type)}
                        >
                            <div className="flex items-center">
                                <span className="inline-block w-5 h-5">
                                    {getServiceIcon(type)}
                                </span>
                                <span className="ml-2">
                                    {type} ({projectCounts[type]})
                                </span>
                            </div>
                        </Button>
                    ))}
                </div>
            </motion.div>

            <AnimatePresence>
                <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6"
                >
                    {filteredServices.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            className="col-span-full"
                        >
                            <EmptyState
                                type={selectedType === "all" ? "project" : selectedType}
                                onCreateProject={() => setIsDialogOpen(true)}
                            />
                        </motion.div>
                    ) : (
                        filteredServices.map((service, index) => (
                            <motion.div
                                key={service.name}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link
                                    href={
                                        service.type === "subworkspace"
                                            ? `/workspace/sub-workspace/${service.name}`
                                            : service.type === "database"
                                                ? `/workspace/database/${service.name}` // New route for database services
                                                : `/workspace/${service.name}`
                                    }
                                    passHref
                                    legacyBehavior
                                >
                                    <div
                                        className={`p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 h-full flex flex-col justify-between relative group cursor-pointer hover:border-purple-500 hover:bg-gray-100 ${new Date().getTime() -
                                        new Date(service.createdAt).getTime() <
                                        24 * 60 * 60 * 1000
                                            ? styles.newProject
                                            : ""
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                {getServiceIcon(service.type)}
                                                <h3 className="font-semibold text-lg text-purple-600 dark:text-purple-400">
                                                    {service.name}
                                                    {new Date().getTime() -
                                                        new Date(service.createdAt).getTime() <
                                                        24 * 60 * 60 * 1000 && (
                                                            <Badge
                                                                className="ml-2 text-xs bg-purple-100 text-purple-700 border border-purple-500 animate-pulse">
                                                                New
                                                            </Badge>
                                                        )}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1 ${service.status
                                                        ? "bg-green-100 text-green-700 border-green-200 animate-pulse"
                                                        : "bg-red-100 text-red-700 border-red-200"
                                                    }`}
                                                >
                                                    {service.status ? (
                                                        <Zap className="w-4 h-4 text-green-700" />
                                                    ) : (
                                                        <PowerOff className="w-4 h-4 text-red-700" />
                                                    )}
                                                </Badge>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                            }}
                                                        >
                                                            <MoreVertical
                                                                className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                const path =
                                                                    service.type === "subworkspace"
                                                                        ? `/workspace/sub-workspace/${service.name}`
                                                                        : `/workspace/${service.name}`;
                                                                router.push(path);
                                                            }}
                                                        >
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleDeleteClick(service);
                                                            }}
                                                            className="text-red-600"
                                                        >
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>

                                        <div className="space-y-4 text-sm">
                                            {service.type !== "subworkspace" && service.gitUrl ? (
                                                <a
                                                    href={service.gitUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center text-blue-600 hover:underline"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <GitBranch className="w-4 h-4 mr-2 flex-shrink-0 text-purple-500" />
                                                    <span className="truncate">{service.gitUrl}</span>
                                                </a>
                                            ) : service.type !== "subworkspace" && service.type !== "database" ? (
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    Git URL not available
                                                </span>
                                            ) : null}

                                            {/* Subworkspace Card  */}
                                            {service?.type === "subworkspace" ? (
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    sub-workspace where you can manage your <span className="text-green-500 font-semibold">microservices</span>.
                                                </span>
                                            ) : service.type === "database" ? (
                                                <div className="space-y-2">
                                                    {/* Database Type */}
                                                    <div className="flex items-center space-x-2">
                                                        <Database className="w-4 h-4 text-purple-500" />
                                                        <span className="truncate">Database Type: {service.dbType}</span>
                                                    </div>

                                                    {/* Username and Password */}
                                                    <div className="flex items-center space-x-2">
                                                        <User2 className="w-4 h-4 text-purple-500" />
                                                        <span className="truncate">User: {service.name}</span>

                                                    </div>

                                                    {/* Port and Domain */}
                                                    {/* <div className="flex items-center space-x-2">
                                                        <Server className="w-4 h-4 text-purple-500" />
                                                        <span className="truncate">Port: {service.port}</span>
                                                        <span className="truncate">Host: {service.subdomain}</span>
                                                    </div> */}
                                                </div>
                                            ) : service.subdomain ? (
                                                <a
                                                    href={`https://${service.subdomain}.cloudinator.cloud`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center text-green-600 hover:underline"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Globe className="w-4 h-4 mr-2 flex-shrink-0" />
                                                    <span
                                                        className="truncate">{`https://${service.subdomain}.cloudinator.cloud`}</span>
                                                    <ExternalLink className="w-3 h-3 ml-1 flex-shrink-0" />
                                                </a>
                                            ) : (
                                                <span className="text-gray-500 dark:text-gray-400">
                                                    Subdomain not available
                                                </span>
                                            )}
                                        </div>

                                        <div
                                            className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                            {service.type !== "subworkspace" && service.type !== "database" && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className={`text-purple-600 border-purple-100 hover:bg-purple-50 dark:hover:bg-purple-900 w-full sm:w-auto ${!service.status ? "opacity-50 cursor-not-allowed" : ""
                                                    }`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        if (service.status) {
                                                            const path =
                                                                service.type === "subworkspace"
                                                                    ? `/workspace/sub-workspace/${service.name}`
                                                                    : `/workspace/${service.name}`;
                                                            router.push(path);
                                                        }
                                                    }}
                                                    disabled={!service.status}
                                                >
                                                    {service.status ? "See More" : "Not Available"}
                                                </Button>
                                            )}
                                            <div className="flex flex-col items-start sm:items-end gap-1">
                                                {isProjectNew(service.name) && (
                                                    <Badge
                                                        className="text-xs bg-purple-100 text-purple-700 border border-purple-500 animate-pulse mb-1">
                                                        New
                                                    </Badge>
                                                )}
                                                <span
                                                    className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                                    <GitBranch className="w-3 h-3 mr-1 flex-shrink-0 text-purple-500" />
                                                    <span className="truncate">
                                                        {service?.type === "subworkspace"
                                                            ? "Sub Workspace"
                                                            : service.type === "database"
                                                                ? `${service.type}`
                                                                : service.branch
                                                        }
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))
                    )}
                </motion.div>
            </AnimatePresence>

            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogTitle className="text-purple-500">
                        Confirm Deletion
                    </DialogTitle>
                    <p>
                        Please type the name of
                        the {serviceToDelete ? "service" : subWorkspaceToDelete ? "subworkspace" : "database"} to
                        confirm deletion:{" "}
                        <strong className="text-purple-500">
                            {serviceToDelete?.name || subWorkspaceToDelete?.name || databaseToDelete?.dbName}
                        </strong>
                    </p>
                    <Input
                        value={deleteConfirmationName}
                        onChange={(e) => setDeleteConfirmationName(e.target.value)}
                        onPaste={(e) => {
                            e.preventDefault(); // Prevent paste action
                            toast({
                                title: "Secure your deletion",
                                description: "Please type the name manually to confirm deletion.",
                                variant: "error",
                            });
                        }}
                        placeholder={`Type ${serviceToDelete ? "service" : subWorkspaceToDelete ? "subworkspace" : "database"} name here`}
                    />
                    <div className="flex justify-end space-x-2 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteModalOpen(false)}
                        >
                            Cancel
                        </Button>
                        {serviceToDelete?.type === "subworkspace" || subWorkspaceToDelete ? (
                            <Button
                                onClick={confirmDeleteSubWorkspace}
                                disabled={
                                    (!serviceToDelete && !subWorkspaceToDelete) ||
                                    deleteConfirmationName !==
                                    (serviceToDelete?.name || subWorkspaceToDelete?.name)
                                }
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                Confirm Delete
                            </Button>
                        ) : serviceToDelete?.type === "database" || databaseToDelete ? (
                            <Button
                                onClick={confirmDeleteDatabase}
                                disabled={
                                    !databaseToDelete ||
                                    deleteConfirmationName !== databaseToDelete.dbName
                                }
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                Confirm Delete Database
                            </Button>
                        ) : (
                            <Button
                                onClick={confirmDelete}
                                disabled={
                                    !serviceToDelete ||
                                    deleteConfirmationName !== serviceToDelete.name
                                }
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                Confirm Delete
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}