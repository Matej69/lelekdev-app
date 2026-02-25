import {
  useFloating,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useInteractions,
} from "@floating-ui/react";
import { useState } from "react";

type PopoverProps = {
  trigger: React.ReactNode;
  children: React.ReactNode;
};

export function Popover({ trigger, children }: PopoverProps) {
  const [open, setOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "top", // 👈 always above
    middleware: [offset(8), flip(), shift()],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
  ]);

  return (
    <>
      <div
        ref={refs.setReference}
        {...getReferenceProps()}
        style={{ display: "inline-block" }}
      >
        {trigger}
      </div>

      {open && (
        <div
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
          className="bg-white border border-gray-400 rounded px-3 py-2"
        >
          {children}
        </div>
      )}
    </>
  );
}