import "./style.css";

export default function Skeleton() {
  return (
    <div className="skeleton flex flex-col gap-1.5">
      <div className="relative overflow-hidden bg-[#eee] h-15"></div>
      <div className="relative overflow-hidden bg-[#eee] h-50"></div>
    </div>
  );
};