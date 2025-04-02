import { useLocation, useOutlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export const RoutePage = () => {
  console.log("routepage mounted");

  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 32 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -32 }}
      >
        <OutletContent />
      </motion.div>
    </AnimatePresence>
  );
};

const OutletContent = () => {
  const outlet = useOutlet();
  return <>{outlet}</>;
};
