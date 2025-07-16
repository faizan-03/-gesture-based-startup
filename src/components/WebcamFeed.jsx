import { useEffect, useRef } from "react";
import * as handpose from "@tensorflow-models/handpose";
import "@tensorflow/tfjs-backend-webgl";

function WebcamFeed({ onGestureTrigger, onAlignmentChange, onAllowVideoPlay }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const gestureTriggered = useRef(false);
  const prevWristRef = useRef(null);

  useEffect(() => {
    const setupCamera = async () => {
      const video = videoRef.current;

      if (!video.srcObject) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        video.srcObject = stream;

        await new Promise((resolve) => {
          video.onloadedmetadata = () => resolve();
        });
      }

      try {
        await video.play();
      } catch (err) {
        console.warn("Video play interrupted:", err);
      }

      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
    };

    const detectGesture = async () => {
      const model = await handpose.load();
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      const detect = async () => {
        if (video.readyState === 4) {
          const predictions = await model.estimateHands(video);

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (predictions.length > 0) {
            const hand = predictions[0];
            const landmarks = hand.landmarks;
            const thumb = landmarks[4];
            const pinky = landmarks[20];
            const isRightHand = thumb[0] < pinky[0];

            const videoWidth = video.videoWidth;
            const videoHeight = video.videoHeight;

            // Draw skeleton
            const palmConnections = [
              [0, 1],
              [1, 2],
              [2, 3],
              [3, 4],
              [0, 5],
              [5, 6],
              [6, 7],
              [7, 8],
              [0, 9],
              [9, 10],
              [10, 11],
              [11, 12],
              [0, 13],
              [13, 14],
              [14, 15],
              [15, 16],
              [0, 17],
              [17, 18],
              [18, 19],
              [19, 20],
            ];
            ctx.lineWidth = 3;
            palmConnections.forEach(([start, end], i) => {
              ctx.beginPath();
              ctx.moveTo(landmarks[start][0], landmarks[start][1]);
              ctx.lineTo(landmarks[end][0], landmarks[end][1]);

              if (i < 4) ctx.strokeStyle = "#ff9800";
              else if (i < 8) ctx.strokeStyle = "#00bcd4";
              else if (i < 12) ctx.strokeStyle = "#4caf50";
              else if (i < 16) ctx.strokeStyle = "#e91e63";
              else ctx.strokeStyle = "#9c27b0";
              ctx.stroke();
            });

            // Draw points
            landmarks.forEach(([x, y], idx) => {
              ctx.beginPath();
              ctx.arc(x, y, 6, 0, 2 * Math.PI);
              ctx.fillStyle = idx === 0 ? "#fff" : "#2196f3";
              ctx.globalAlpha = 0.7;
              ctx.fill();
              ctx.globalAlpha = 1.0;
            });

            // Wrist logic
            const wrist = landmarks[0];
            const wristX = wrist[0];
            const wristY = wrist[1];

            if (prevWristRef.current) {
              ctx.beginPath();
              ctx.moveTo(prevWristRef.current[0], prevWristRef.current[1]);
              ctx.lineTo(wristX, wristY);
              ctx.strokeStyle = "#00ff00";
              ctx.lineWidth = 4;
              ctx.stroke();
            }
            prevWristRef.current = [wristX, wristY];

            // Alignment box
            const boxXMin = videoWidth / 2 - 80;
            const boxXMax = videoWidth / 2 + 80;
            const boxYMin = videoHeight / 2 - 120;
            const boxYMax = videoHeight / 2 + 120;

            // Alignment check
            const isAligned =
              wristX > boxXMin &&
              wristX < boxXMax &&
              wristY > boxYMin &&
              wristY < boxYMax &&
              isRightHand;

            onAlignmentChange?.(isAligned); // Notify parent

            if (isAligned && !gestureTriggered.current) {
              gestureTriggered.current = true;
              

              // Notify App that gesture was triggered
              onGestureTrigger();

              // Wait 3 seconds, then allow video playback
              setTimeout(() => {
                console.log("3s delay over, show startup video now");
                onAllowVideoPlay?.(); // Optional callback to App
                gestureTriggered.current = false;
              }, 3000); // 3s wait
            }
          } else {
            prevWristRef.current = null;
            onAlignmentChange?.(false); //  Not aligned if no hand
          }
        }

        requestAnimationFrame(detect);
      };

      detect();
    };

    setupCamera().then(detectGesture);
  }, [onGestureTrigger, onAlignmentChange]);

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover opacity-60"
        autoPlay
        muted
        playsInline
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
}

export default WebcamFeed;
