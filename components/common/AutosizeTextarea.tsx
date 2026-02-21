import { useRef, useEffect, useLayoutEffect } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface AutosizeTextareaProps {
  placeholder?: string,
  register?: UseFormRegisterReturn
}


export default function AutosizeTextarea({ placeholder, register }: AutosizeTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    if (ref.current) {
      ref.current.style.height = "0"; // reset
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  };

  return (
    <>
      <textarea
        {...register}
        className="w-full p-2 rounded focus:outline-none border-2 border-transparent focus:border-gray-300 resize-none overflow-hidden"
        rows={1}
        placeholder={placeholder}
        ref={(el) => {  // assign ref to both react-hook-form and local ref, without it registers internal ref would be overridden
          register?.ref(el);
          ref.current = el;
        }}
        onChange={(e) => {
          register?.onChange(e); // Has to be called directly since textarea.onChange overrides register.onChange
          resize();
        }}
      />    
    </>
  );
}