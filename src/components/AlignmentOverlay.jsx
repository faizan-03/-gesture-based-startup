function AlignmentOverlay({ isAligned }) {
  return (
    <>
      {/* Glowing alignment box */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <div
          className={`w-40 h-60 sm:w-48 sm:h-72 border-4 rounded-2xl transition-all duration-300 ${
            isAligned
              ? "border-green-400 shadow-[0_0_30px_10px_rgba(34,197,94,0.6)] animate-pulse"
              : "border-white opacity-30"
          }`}
        />
      </div>

      {/* Access Status Text */}
      <div className="absolute bottom-6 w-full flex justify-center z-30 pointer-events-none px-4">
        <div className="text-center text-base sm:text-xl font-medium tracking-wide">
          {isAligned ? (
            <span className="text-green-400 animate-fade-in">
               Hand Verified. Access Granted
            </span>
          ) : (
            <span className="text-white opacity-80">
              ✋ Align your left hand with the box to activate
            </span>
          )}
        </div>
      </div>
    </>
  );
}

export default AlignmentOverlay;
