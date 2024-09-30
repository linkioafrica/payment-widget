import React, { useState } from "react";
import { Icons } from "@/app/icons"; // Import your icons
import { useDevice } from "@/contexts/DeviceContext";

export const CopyToClipboard = ({
  textTobeCopied,
}: {
  textTobeCopied: string;
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const { isMobile } = useDevice();

  const handleCopy = () => {
    navigator.clipboard.writeText(textTobeCopied).then(() => {
      setIsCopied(true);
      // Reset back to copy icon after 2 seconds
      setTimeout(() => setIsCopied(false), 5000);
    });
  };

  return (
    <div
      onClick={handleCopy}
      style={{ cursor: "pointer" }}
      className="items-center flex justify-center w-6 h-6"
    >
      <i
        className={` inline-block relative dark:text-[#4893FF]  ${isMobile ? "w-5 h-5" : "w-4 h-4"}`}
        style={{
          opacity: isCopied ? 0 : 1,
          transition: "opacity 0.5s ease",
          position: isCopied ? "absolute" : "static", // Ensure smooth replacement
        }}
      >
        {Icons.copy}
      </i>
      <i
        className={` inline-block relative  text-blue-500 dark:text-white ${isMobile ? "w-5 h-5" : "w-4 h-4"}`}
        style={{
          opacity: isCopied ? 1 : 0,
          transition: "opacity 0.5s ease",
          position: isCopied ? "static" : "absolute",
        }}
      >
        {Icons.check}
      </i>
    </div>
  );
};
