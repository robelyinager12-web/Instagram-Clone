import { useEffect, useRef, useState } from "react";

export function useAutoplayInView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.6 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isInView) {
      video.play().catch(() => {
        // Autoplay can be blocked before any user gesture — fine, the
        // tap-to-unmute/play interaction below covers that case.
      });
    } else {
      video.pause();
    }
  }, [isInView]);

  return { containerRef, videoRef, isInView };
}
