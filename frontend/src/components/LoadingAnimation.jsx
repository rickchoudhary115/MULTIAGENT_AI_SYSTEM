import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

function LoadingAnimation() {
  const Thinking_Lables = ["Thinking", "Analyzing", "Reasoning", "Generating"];

  const [labelIndex, setLabelIndex] = useState(0);

  const label = Thinking_Lables[labelIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setLabelIndex((prev) => (prev + 1) % Thinking_Lables.length);
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 max-w-[72%] py-1">
      {/* Orb Animation */}
      <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
        {[0, 0.6, 1.2].map((delay, index) => (
          <motion.div
            key={index}
            className="absolute inset-0 rounded-full border border-cyan-400/40"
            initial={{
              scale: 0.3,
              opacity: 0.6,
            }}
            animate={{
              scale: 1.7,
              opacity: 0,
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeOut",
              delay,
            }}
          />
        ))}

        <motion.span
          className="absolute w-2.5 h-2.5 rounded-full bg-gradient-to-br from-indigo-400 via-violet-500 to-purple-600"
          style={{
            boxShadow: "0 0 14px rgba(99, 102, 241, 0.5)",
          }}
          animate={{
            scale: [1, 1.25, 1],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Animated Text */}
      <div className="flex items-center overflow-hidden text-sm text-slate-400">
        <AnimatePresence mode="wait">
          <motion.div
            key={label}
            className="flex"
            initial={{
              opacity: 0,
              y: 6,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -6,
            }}
            transition={{
              duration: 0.25,
              ease: "easeOut",
            }}
          >
            {label.split("").map((ch, i) => (
              <motion.span
                key={`${label}-${i}`}
                className="text-[13px] font-medium tracking-wide text-slate-400"
                animate={{
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.07,
                }}
              >
                {ch}
              </motion.span>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Animated dots */}
        <div className="flex ml-0.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              animate={{
                opacity: [0.2, 1, 0.2],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            >
              .
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LoadingAnimation;
