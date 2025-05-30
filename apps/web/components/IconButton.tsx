import { ReactNode } from "react";

export function IconButton({
  icon,
  onClick,
  activated,
}: {
  icon: ReactNode;
  onClick: () => void;
  activated: boolean;
}) {
  return (
    <div
      className={`p-2 rounded-lg cursor-pointer transition-colors flex items-center justify-center
        ${activated ? "bg-[#7F8CAA] text-white" : "text-gray-100 hover:bg-neutral-700"}`}
      onClick={onClick}
      style={{ minWidth: "36px", minHeight: "36px" }}
    >
      {icon}
    </div>
  );
}
