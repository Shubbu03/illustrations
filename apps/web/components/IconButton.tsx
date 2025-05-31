import { ReactNode, forwardRef } from "react";

export const IconButton = forwardRef<
  HTMLDivElement,
  {
    icon: ReactNode;
    onClick: () => void;
    activated: boolean;
  }
>(({ icon, onClick, activated }, ref) => {
  return (
    <div
      ref={ref}
      className={`p-2 rounded-lg cursor-pointer transition-colors flex items-center justify-center
        ${activated ? "bg-[#7F8CAA] text-white" : "text-gray-100 hover:bg-neutral-700"}`}
      onClick={onClick}
      style={{ minWidth: "36px", minHeight: "36px" }}
    >
      {icon}
    </div>
  );
});

IconButton.displayName = "IconButton";
