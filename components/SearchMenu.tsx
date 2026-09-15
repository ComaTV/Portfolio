"use client"

import { useState, forwardRef } from "react"

interface SearchMenuProps {
    isOpen: boolean;
}

const SearchMenu = forwardRef<HTMLDivElement, SearchMenuProps>(function SearchMenu({ isOpen }, ref) {
    const [activeTab, setActiveTab] = useState("All");

    if (!isOpen) return null;

    const tabs = ["All", "Apps", "Projects"];

    return (
        <div ref={ref} className="absolute bottom-20 left-20 w-[45vw] h-[50vh] bg-gray-900">
            <div className="flex justify-start w-full h-20 bg-gray-950">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className="relative h-20 px-6 flex items-center"
                    >
                        <p
                            className={`text-3xl ${
                                activeTab === tab ? "text-white" : "text-gray-400"
                            } hover:text-white transition-colors`}
                        >
                            {tab}
                        </p>

                        {activeTab === tab && (
                            <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-500" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    )
});

export default SearchMenu;