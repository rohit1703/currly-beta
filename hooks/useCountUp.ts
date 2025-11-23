import { useSpring, useTransform } from "framer-motion";
import { useEffect } from "react"; // <--- MOVED THIS TO REACT

export function useCountUp(value: number, duration: number = 2) {
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 });
  const display = useTransform(spring, (current) => 
    Math.round(current).toLocaleString()
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return display;
}