"use client"

import { forwardRef } from "react"

interface StartMenuProps {
    isOpen: boolean;
}

const StartMenu = forwardRef<HTMLDivElement, StartMenuProps>(function StartMenu({ isOpen }, ref) {
    if (!isOpen) return null;

    return (
        <div ref={ref} className="absolute bottom-20 left-0 w-[30vw] h-[45vh] bg-gray-900">
            <div className="py-4 p-2 w-20 h-full space-y-10 bg-gray-950">
                <div className="bg-amber-600 rounded-4xl w-15 h-15"/>
            </div>
        </div>
    )

})
export default StartMenu;