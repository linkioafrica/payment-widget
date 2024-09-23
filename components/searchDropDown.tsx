import { Icons } from "@/app/icons";
import { useState } from "react";

export const SearchDropDown = ({
  placeholder,
  dropDownData,
  dropDownDataKey,
}: any) => {
  const [isActive, setIsActive] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  return (
    <div className="flex w-full flex-col relative">
      <div
        className="w-full border-[0.8px]  border-[#E2E3E7] text-black flex justify-between items-center rounded-lg bg-[#F3F3F3] hover:border-black
        dark:bg-[#141415] dark:border-[#242425]
        "
        onClick={() => setIsActive(!isActive)}
      >
        <input
          type="text"
          className="w-full outline-none text-lg px-3 py-4 rounded-lg bg-[#F3F3F3] dark:bg-[#141415] dark:text-white"
          placeholder={placeholder}
          value={searchValue}
          onChange={(change) => setSearchValue(change.target.value)}
          // Hide dropdown on blur
        />
        <i className="px-3 py-4 cursor-pointer dark:text-[#9F9F9F]">
          {Icons.chevron_down}
        </i>
      </div>
      {isActive && (
        <div className="w-full absolute -bottom-1">
          <div
            className="w-screen h-screen bg-black fixed top-0 left-0 opacity-0"
            onClick={() => setIsActive(false)}
          ></div>
          <div className="w-full white max-h-[200px] flex flex-col translate-y-full border-[0.8px] border-[#E2E3E7] bg-[#F3F4F6] rounded-lg py-2 overflow-auto shadow-lg dark:bg-[#101113] dark:border-[#242425]">
            {dropDownData
              .filter((data: any) => {
                // Check if the searchValue is included in the dropdown data (case-insensitive)
                const itemValue = data[dropDownDataKey].toLowerCase();
                const searchLower = searchValue.toLowerCase();
                return itemValue.includes(searchLower);
              })
              .map((data: any, index: number) => (
                <span
                  key={index}
                  className="py-2 px-6 hover:bg-[#E2E3E7] select-none cursor-pointer dark:text-[#F9F9F9] dark:hover:bg-[#282828]"
                  onClick={() => {
                    setSearchValue(data[dropDownDataKey]);
                    setIsActive(false);
                  }}
                >
                  {data[dropDownDataKey]}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
