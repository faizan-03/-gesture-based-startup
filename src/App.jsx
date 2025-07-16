import { useState } from "react";
import StartupPlayer from "./components/StartupPlayer";
import WebcamFeed from "./components/WebcamFeed";
import AlignmentOverlay from "./components/AlignmentOverlay";

function App() {
  const [isAligned, setIsAligned] = useState(false);
  const [isTriggered, setIsTriggered] = useState(false);      //  missing state
  const [canPlayVideo, setCanPlayVideo] = useState(false);    //  added for 30s wait

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden text-white">
      {/* Live webcam feed + gesture tracking */}
      <WebcamFeed
        onGestureTrigger={() => setIsTriggered(true)}        
        onAlignmentChange={setIsAligned}
        onAllowVideoPlay={() => setCanPlayVideo(true)}         
      />

      {/* Triggered animation */}
      {canPlayVideo && (
        <div className="absolute inset-0 z-50">
          <StartupPlayer
            onFinish={() => {
              setIsTriggered(false);
              setCanPlayVideo(false);
            }}
          />
        </div>
      )}

      {/* Alignment overlay */}
      {!canPlayVideo && <AlignmentOverlay isAligned={isAligned} />}

      {/* Hand sketch overlay */}
      {!canPlayVideo && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="w-40 h-60 border-4 border-white rounded-xl opacity-40 animate-pulse"></div>
        </div>
      )}

     
    </div>
  );
}

export default App;
