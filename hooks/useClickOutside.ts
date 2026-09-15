import { useEffect, RefObject } from "react";

export function useClickOutside(
    refs: RefObject<HTMLElement | null>[],
    onOutsideClick: () => void
) {
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            const target = e.target as Node;
            const clickedInside = refs.some(ref => ref.current?.contains(target));
            if (!clickedInside) onOutsideClick();
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [refs, onOutsideClick]);
}