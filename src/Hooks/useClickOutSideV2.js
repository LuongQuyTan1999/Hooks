/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from 'react'

export default function useClickOutSide(callback) {
    const ref = useRef(null)

    const handleClickOutside = (event) => {
        if (ref.current && !ref.current.contains(event.target)) {
            callback()
        }
    }

    useEffect(() => {
        document.addEventListener('click', handleClickOutside)
        return () => {
            document.removeEventListener('click', handleClickOutside)
        }
    }, [ref])

    return ref
}


// Use:   const ref = useComponentVisible(() => setIsVisible(true))