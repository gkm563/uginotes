"use client";

import { motion } from "framer-motion";

export function LogoAnimation({ src }: { src: string }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      className="h-24 w-64 md:h-28 md:w-80 rounded-[2rem] flex items-center justify-center overflow-hidden mb-10 mx-auto bg-white shadow-2xl shadow-black/10 border border-white/20 p-4"
    >
      <img src={src} alt="College Logo" className="h-full w-full object-contain" />
    </motion.div>
  );
}
