"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import logo from "@/public/cloudinator-v2.1.png";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ModeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const NavBarHomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const router = useRouter();
  const { user, loading, error } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const announcementHeight =
        document.querySelector(".announcement-bar")?.clientHeight || 0;
      setIsSticky(window.scrollY > announcementHeight);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    console.log("Auth state:", { user, loading, error });
  }, [user, loading, error]);

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/service", label: "Service" },
    {
      path: "https://doc.cloudinator.cloud/",
      label: "Document",
      target: "_blank",
      rel: "noopener noreferrer",
    },
    { path: "/start-building", label: "Start Building" },
    { path: "/about", label: "About" },
  ];

  const renderAuthButtons = () => {
    if (loading) {
      return (
        <div className="h-10 w-24 bg-gray-200 animate-pulse rounded"></div>
      );
    }

    if (user && !error) {
      return (
        <>
          <Button
            asChild
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Link href="/dashboard">DASHBOARD</Link>
          </Button>
        </>
      );
    }

    return (
      <>
        <Button
          asChild
          className="bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
          onClick={()=> router.push("https://oauth2.cloudinator.istad.co/register")}
        >
          {/* <Link href={"/identity/register"}>SIGN UP</Link> */}
          <span>SIGN UP</span>
        </Button>
        <Button
          asChild
          variant="outline"
          className="border-purple-600 text-purple-600 hover:bg-purple-100 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-900"
        >
          <Link href={"/oauth2/authorization/devops"}>SIGN IN</Link>
        </Button>
      </>
    );
  };

  return (
    <>
      <header
        className={`bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-50 transition-all duration-300 ${
          isSticky ? "fixed top-0 left-0 right-0 shadow-lg" : ""
        }`}
      >
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-between items-center ">
            <Link href="/" aria-label="Home">
              <Image
                src={logo}
                alt="Cloudinator"
                width={100}
                height={100}
                className="w-16 h-22"
              />
            </Link>
            <nav className="hidden md:flex space-x-2 py-4">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  asChild
                  className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 ease-in-out"
                >
                  {item.target ? (
                    <a href={item.path} target={item.target} rel={item.rel}>
                      {item.label}
                    </a>
                  ) : (
                    <Link href={item.path}>{item.label}</Link>
                  )}
                </Button>
              ))}
            </nav>

            <div className="hidden md:flex items-center space-x-4">
              <ModeToggle />
              {renderAuthButtons()}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
          {isMenuOpen && (
            <div className="md:hidden mt-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md">
              <nav className="flex flex-col space-y-2 p-4">
                {navItems.map((item) => (
                  <Button
                    key={item.path}
                    variant="ghost"
                    asChild
                    className="justify-start text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 ease-in-out"
                  >
                    {item.target ? (
                      <a href={item.path} target={item.target} rel={item.rel}>
                        {item.label}
                      </a>
                    ) : (
                      <Link href={item.path}>{item.label}</Link>
                    )}
                  </Button>
                ))}
              </nav>

              <div className="mt-4 flex flex-col space-y-4 p-4">
                <ModeToggle />
                {renderAuthButtons()}
              </div>
            </div>
          )}
        </div>
      </header>
      {isSticky && <div style={{ height: "96px" }} />}
    </>
  );
};

export default NavBarHomePage;
