import { useRef, useEffect } from "react";

function StartupPlayer({ onFinish }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;

    if (video) {
      video.play();

      const handleEnded = () => {
        onFinish(); // Hide video when done
      };

      video.addEventListener("ended", handleEnded);

      return () => {
        video.removeEventListener("ended", handleEnded);
      };
    }
  }, [onFinish]);

  return (
    <video
      ref={videoRef}
      src="/faizan_startup.mp4"
      className="w-full h-full object-cover"
      autoPlay
      muted={false}
      playsInline
    />
  );
}

export default StartupPlayer;
