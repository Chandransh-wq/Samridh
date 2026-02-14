import { motion, type Variants } from "framer-motion"; // 1. Import Variants type

const Loader2 = ({ darkMode }: { darkMode?: boolean }) => {
  // 2. Add the type here
  const dotVariants: Variants = {
    animate: (index: number) => ({
      y: [0, -8, 0, 0, 0],
      opacity: [0.3, 1, 0.3, 0.3, 0.3],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        delay: index * 0.15,
        ease: "easeInOut", // TypeScript now knows this is a valid Easing string
      },
    }),
  };

  return (
    <div className="flex items-center gap-2 px-1">
      {[0, 1, 2, 3].map((index) => (
        <motion.div
          key={index}
          custom={index}
          variants={dotVariants}
          animate="animate"
          className={`h-1.5 w-1.5 rounded-full ${
            darkMode
              ? "bg-blue-400 shadow-[0_0_8px_#60a5fa]"
              : "bg-blue-600 shadow-[0_0_4px_#2563eb]"
          }`}
        />
      ))}
    </div>
  );
};

export default Loader2;
