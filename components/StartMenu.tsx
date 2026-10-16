"use client"

import Image from "next/image";
import { forwardRef, useState, useRef } from "react"
import { useClickOutside } from "@/hooks/useClickOutside";
import ProfileMenu from "./ProfileMenu";

interface StartMenuProps {
    isOpen: boolean;
}

type MenuId = "profile" | "settings" | null;

const StartMenu = forwardRef<HTMLDivElement, StartMenuProps>(function StartMenu({ isOpen }, ref) {
    const [openMenu, setOpenMenu] = useState<MenuId>(null);

    const toggleMenu = (id: MenuId) => 
        setOpenMenu(prev => (prev === id ? null : id));

    const profileButtonRef = useRef<HTMLButtonElement>(null);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    const settingsButtonRef = useRef<HTMLButtonElement>(null);
    const settingsMenuRef = useRef<HTMLDivElement>(null);

    useClickOutside([profileButtonRef,profileMenuRef], () => {
        if (openMenu === "profile") setOpenMenu(null);
    })

    useClickOutside([settingsButtonRef,settingsMenuRef], () => {
        if (openMenu === "settings") setOpenMenu(null);
    })

    return (
        <div ref={ref} className={`absolute bottom-20 left-0 w-[30vw] h-[45vh] bg-gray-900 ${!isOpen ? 'hidden' : ''}`}>
            <ProfileMenu isOpen={openMenu === "profile"} ref={profileMenuRef} />
            <div className="py-4 p-2 w-20 h-full space-y-10 bg-gray-950">
                
                <button
                    ref={profileButtonRef}
                    onClick={() => toggleMenu("profile")}
                    className="rounded-full w-15 h-15"
                >
                    <Image
                        src="/man.jpg"
                        alt="icon"
                        className="w-15 h-15 object-container rounded-full"
                        width={140}
                        height={140}
                        loading="eager"
                    />
                </button>

                <button
                    ref={settingsButtonRef}
                    onClick={() => toggleMenu("settings")}
                    className="w-15 h-15"
                >
                    <Image
                        src="/settings.png"
                        alt="icon"
                        className="w-15 h-15"
                        width={140}
                        height={140}
                        loading="eager"
                    />
                </button>

            </div>
        </div>
    )

})
export default StartMenu;