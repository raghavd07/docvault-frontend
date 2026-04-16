import { motion } from "framer-motion";

export default function GlassCard({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`
        bg-glass
        backdrop-blur-md
        border border-glassBorder
        rounded-2xl
        shadow-xl
        p-6
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}