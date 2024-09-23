import React from "react";
import Image from "next/image";

export const CircularLoader = ({ classes }: any) => {
  return (
    <div className={`circular-loader ${classes}`}>
      <Image
        src={"/assets/icons/spinner.png"}
        alt="Plaid Icon"
        width={150}
        height={150}
      />
    </div>
  );
};
