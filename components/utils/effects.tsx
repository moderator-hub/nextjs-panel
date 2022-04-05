import { useEffect, useState } from "react"

export function useWindowSize(setSize: (data: number[]) => void) {
  useEffect(() => {
    function updateSize() { setSize([window.innerWidth, window.innerHeight]) }
    window.addEventListener("resize", updateSize)
    updateSize()
    return () => window.removeEventListener("resize", updateSize)
  }, [setSize])
}

export function useWindowState(): number[] {
  const [size, setSize] = useState<number[]>([0, 0])
  useWindowSize(setSize)
  return size
}