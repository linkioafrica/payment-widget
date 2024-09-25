export default function Tag({ text, bgColor, textColor, icon, classes }: any) {
  return (
    <span
      className={` text-[10px]  py-[2px] px-2 rounded-full text-nowrap ${icon && "flex items-center gap-1"} ${bgColor} ${textColor} ${classes}`}
    >
      {icon}
      {text}
    </span>
  );
}
