interface StartMenuProps {
    isOpen: boolean;
}

export default function StartMenu({ isOpen }: StartMenuProps) {
    if(!isOpen) return null;

    return (
        <div className="absolute bottom-20 left-0 w-[40vw] h-[55vh] bg-gray-700 rounded-t shadow-lg">
            <div className="p-2 space-y-2 w-20 h-full bg-blue-700">
                <div className="rounded-4xl w-15 h-15 bg-amber-600"></div>
                <div className="rounded-4xl w-15 h-15 bg-amber-600"></div>
                <div className="rounded-4xl w-15 h-15 bg-amber-600"></div>
                <div className="rounded-4xl w-15 h-15 bg-amber-600"></div>
                <div className="rounded-4xl w-15 h-15 bg-amber-600"></div>
            </div>
        </div>
    )
}