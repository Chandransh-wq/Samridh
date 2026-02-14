import { motion } from "framer-motion";

const Loader = ({ darkMode }: { darkMode: boolean }) => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="relative flex items-center justify-center">
      {/* Outer pulsating ring */}
      <motion.div
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute h-16 w-16 rounded-full border-2 ${
          darkMode ? "border-blue-400" : "border-blue-600"
        }`}
      />
      {/* Inner solid circle with glassmorphism */}
      <div
        className={`h-10 w-10 rounded-full border shadow-xl backdrop-blur-md ${
          darkMode
            ? "bg-white/10 border-white/20"
            : "bg-black/5 border-black/10"
        }`}
      />
    </div>
  </div>
);

export default Loader;
