export default function Tag({ text, bgColor, textColor, icon, classes }: any) {
  return (
    <span
      className={` text-[9px]  font-medium py-[1px] px-2 rounded-full text-nowrap ${icon && "flex items-center gap-1"} ${bgColor} ${textColor} ${classes}`}
    >
      {icon}
      {text}
    </span>
  );
}
