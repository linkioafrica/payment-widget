import React from "react";
import Image from "next/image";

export const CircularLoader = ({ classes }: any) => {
  return (
    <div className={`circular-loader ${classes}`}>
      <Image
        src={"/assets/icons/spinner.png"}
        alt="Plaid Icon"
        width={100}
        height={100}
      />
    </div>
  );
};
