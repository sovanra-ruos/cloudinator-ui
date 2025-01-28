import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: "Cloudinator Documentation | Cloud Deployment Guide",
    description: "Access comprehensive documentation for Cloudinator, your all-in-one cloud deployment and microservices management platform. Learn how to streamline your cloud infrastructure with our detailed guides and tutorials.",
    keywords: [
        "Cloudinator documentation",
        "cloud deployment guide",
        "microservices management",
        "cloud infrastructure tutorials",
        "DevOps documentation"
    ],
    openGraph: {
        title: "Cloudinator Docs: Master Cloud Deployment and Microservices",
        description: "Dive into Cloudinator's comprehensive documentation. Learn to deploy, manage, and optimize your cloud infrastructure and microservices with ease.",
        url: "https://cloudinator-document.cloudinator.cloud/",
        siteName: "Cloudinator",
        images: [
            {
                url: "https://www.cloudinator.com/docs-og-image.jpg",
                width: 1200,
                height: 630,
                alt: "Cloudinator Documentation Overview",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    alternates: {
        canonical: "https://cloudinator-document.cloudinator.cloud/",
    },
};

export default function DocumentPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-purple-100 p-4">
            <h1 className="text-4xl font-bold text-violet-600 text-center mb-4">Cloudinator Documentation</h1>
            <p className="mt-4 text-lg text-gray-700 text-center max-w-2xl">
                Explore our comprehensive guides and tutorials to master Coordinator&#39;s powerful cloud deployment and microservices management features.
            </p>
            <Link href="https://cloudinator-doc-vercel.vercel.app/" passHref>
                <Button className="mt-6 bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out transform hover:scale-105">
                    Access Documentation
                </Button>
            </Link>
            <p className="mt-4 text-sm text-gray-600">
                Our documentation is hosted on a secure, verified platform for your peace of mind.
            </p>
        </div>
    );
}

