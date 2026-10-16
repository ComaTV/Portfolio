import { forwardRef } from "react"

interface ProfileMenuProps {
    isOpen: boolean;
}

const ProfileMenu = forwardRef<HTMLDivElement, ProfileMenuProps>(function ProfileMenu({ isOpen }, ref) {
    return (
        <div ref={ref} className={`absolute top-22 left-0 w-130 h-70 rounded-2xl p-4 bg-gray-700 ${!isOpen ? 'hidden' : ''}`}>
            
        </div>
    )
})

export default ProfileMenu