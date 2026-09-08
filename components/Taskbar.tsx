"use client"

import Image from "next/image";
import { useState } from "react"
import StartMenu from "./StartMenu";

export default function Taskbar()
{
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="absolute bottom-0 left-0 w-screen h-20 bg-gray-800">

            <StartMenu isOpen={menuOpen}/>

            <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center justify-center w-20 h-20 hover:bg-white/10 active:bg-white/20 transition-colors"
            >
                <Image
                    src="/windows10-icon.png"
                    alt="icon"
                    className="w-15 h-15 object-contain"
                    width={5}
                    height={5}
                    loading="eager"
                />
            </button>
        </div>
    )
}