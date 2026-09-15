"use client"

import Image from "next/image";
import { useState, useRef } from "react"
import { Search } from "lucide-react"
import StartMenu from "./StartMenu";
import SearchMenu from "./SearchMenu"
import { useClickOutside } from "@/hooks/useClickOutside";

type MenuId = "start" | "search" | null;

export default function Taskbar()
{
    const [openMenu, setOpenMenu] = useState<MenuId>(null);
    const [searchValue, setSearchValue] = useState("");

    const toggleMenu = (id: MenuId) =>
        setOpenMenu(prev => (prev === id ? null : id));

    const startButtonRef = useRef<HTMLButtonElement>(null);
    const startMenuRef = useRef<HTMLDivElement>(null);

    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchMenuRef = useRef<HTMLDivElement>(null);

    useClickOutside([startButtonRef, startMenuRef], () => {
        if (openMenu === "start") setOpenMenu(null);
    });
    useClickOutside([searchInputRef, searchMenuRef], () => {
        if (openMenu === "search") setOpenMenu(null);
    });

    return (
        <div className="absolute w-screen h-screen">

            <StartMenu isOpen={openMenu === "start"} ref={startMenuRef}/>
            <SearchMenu isOpen={openMenu === "search"} ref={searchMenuRef}/>

            <div className="flex justify-start absolute bottom-0 left-0 w-screen h-20 bg-gray-800">
                <button
                    ref={startButtonRef}
                    onClick={() => toggleMenu("start")}
                    className="w-20 h-20 hover:bg-white/10 active:bg-white/20 transition-colors"
                >
                    <Image
                        src="/windows10-icon.png"
                        alt="icon"
                        className="w-18 h-15 object-contain"
                        width={160}
                        height={160}
                        loading="eager"
                    />
                </button>

                <div className="flex items-center w-120 h-20 bg-white border-4 border-gray-900 px-4">
                    <Search className="w-10 h-10 text-gray-900 shrink-0"/>

                    <input
                        ref={searchInputRef}
                        type="text"
                        value={searchValue}
                        placeholder="Search"
                        className="w-full h-full ml-3 text-black text-2xl bg-transparent outline-none placeholder:text-gray-500"
                        onChange={(e) => setSearchValue(e.target.value)}
                        onClick={() => toggleMenu("search")}
                    />
                </div>
            </div>
        </div>
    )
}