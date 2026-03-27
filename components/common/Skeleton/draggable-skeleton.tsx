import "./style.css";

export default function DraggableSkeleton() {
  return (
    <div className="skeleton flex flex-col gap-1.5">
      <div className="relative overflow-hidden bg-[#f1f1f1]/50 h-10 "></div>
      <div className="relative overflow-hidden bg-[#f5f5f5]/50 h-22"></div>
    </div>
  );
};