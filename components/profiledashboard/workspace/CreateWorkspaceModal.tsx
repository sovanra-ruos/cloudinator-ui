"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Zap, Loader2 } from 'lucide-react'
import { useCreateWorkspaceMutation, useGetWorkspacesQuery } from "@/redux/api/projectApi"
import { useToast } from "@/hooks/use-toast"

interface ErrorResponse {
    status?: string;
    originalStatus?: number;
    data?: {
        message?: string;
    };
}

export function CreateWorkspaceModal() {
    const { toast } = useToast()
    const [open, setOpen] = useState(false)
    const [workspaceName, setWorkspaceName] = useState("")
    const [isCreating, setIsCreating] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const { data, refetch } = useGetWorkspacesQuery()

    const [createWorkspace] = useCreateWorkspaceMutation()

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

    const handleCreateWorkspace = async () => {
        setIsCreating(true)
        const formattedWorkspaceName = workspaceName.trim().replace(/\s+/g, '-')
        try {
            const results = await createWorkspace({ name: formattedWorkspaceName }).unwrap();

            toast({
                title: "Success",
                description: `Workspace "${formattedWorkspaceName}" created successfully!`,
                variant: "success",
                duration: 3000,
            })

            console.log(results)


        } catch (err) {
            const error = err as ErrorResponse
            console.error(error)

            if (error?.status === "PARSING_ERROR" && error?.originalStatus === 200) {
                toast({
                    title: "Success",
                    description:
                        error?.data?.message ||
                        `Workspace Create Successfull.`,
                    variant: "success",
                    duration: 3000,
                });
                setWorkspaceName("")
                setOpen(false)
                refetch()
            } else {
                toast({
                    title: "Error",
                    description:
                        error?.data?.message ||
                        "Failed to create workspace. Please try again.",
                    variant: "error",
                    duration: 5000,
                });
            }
        } finally {
            setIsCreating(false)
            refetch()
        }
    }

    if (!data) return null

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    className="bg-purple-500 text-primary-foreground hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={data && data.length > 0}
                >
                    <Zap className="mr-2 h-4 w-4" />
                    Create Workspace
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Workspace</DialogTitle>
                    <DialogDescription>
                        Enter a name for your new workspace and bring your ideas to life.
                    </DialogDescription>
                </DialogHeader>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="py-4"
                >
                    <Input
                        ref={inputRef}
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                        className="w-full"
                        placeholder="My Awesome Workspace"
                    />
                    <AnimatePresence>
                        {workspaceName && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mt-2 text-sm text-muted-foreground"
                            >
                                Great name! Your workspace is going to be amazing.
                            </motion.p>
                        )}
                    </AnimatePresence>
                </motion.div>
                <DialogFooter>
                    <Button
                        onClick={handleCreateWorkspace}
                        className="w-full bg-purple-500 hover:bg-purple-800"
                        disabled={!workspaceName.trim() || isCreating}
                    >
                        {isCreating ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Zap className="mr-2 h-4 w-4" />
                        )}
                        {isCreating ? "Creating..." : "Create Workspace"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
