import { Icons } from "@/app/icons";
import { Currency } from "@/constants/currencies";
import Image from "next/image";
import { useState } from "react";
export const CurrencyDropDown = () => {
  const [dropDown, setDropDown] = useState(false);
  return (
    <div className="relative w-fit select-none">
      <div
        className="border-[0.8px] border-[#E2E3E7] text-black  px-2 py-1 flex items-center gap-2 hover:border-black cursor-pointer rounded-md"
        onClick={() => setDropDown(!dropDown)}
      >
        <Image
          src={Currency[1].image}
          alt={"flag"}
          width={20}
          height={20}
          priority
        />
        <span className="font-semibold">BRL</span> <i>{Icons.chevron_down}</i>
      </div>
      {dropDown && (
        <div>
          <div
            className="bg-black w-screen h-screen fixed top-0 left-0 opacity-0"
            onClick={() => setDropDown(false)}
          ></div>
          <div className="absolute left-0 w-full -bottom-1 pt-1 drop-shadow-xl z-10 border-[0.8px] border-[#E2E3E7] translate-y-full bg-white max-h-[200px] overflow-y-auto rounded-md">
            {Currency.map((currency) => (
              <div className="flex items-center border-b border-[#E2E3E7] py-2 px-2 gap-2 text-black cursor-pointer hover:bg-[#a6cbfe50]">
                <Image
                  src={currency.image}
                  alt={`${currency.name} flag`}
                  width={26}
                  height={26}
                  priority
                />
                <span className="font-semibold">{currency.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
