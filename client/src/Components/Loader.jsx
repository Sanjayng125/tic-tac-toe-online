import React from "react";
import { FaSpinner } from "react-icons/fa6";

const Loader = () => {
  return (
    <div className="w-full h-[70vh] flex justify-center items-center">
      <FaSpinner className="animate-spin w-32 h-32" />
    </div>
  );
};

export default Loader;
