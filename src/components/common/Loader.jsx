import { Tailspin } from "ldrs/react";
import "ldrs/react/Tailspin.css";

const Loader = () => {
  return (
    <div className="flex items-center justify-center">
      <Tailspin
        size="18"
        stroke="4"
        speed="0.9"
        color="white"
      />
    </div>
  );
};

export default Loader;