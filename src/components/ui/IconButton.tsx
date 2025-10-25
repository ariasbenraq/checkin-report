// src/components/ui/IconButton.tsx
import React from "react";
import { Icon } from "./Icon";

type Variant = "ghost" | "solid" | "danger" | "primary" | "outline";
type Size = "sm" | "md";



export type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: string;
  label: string;                // accesible
  title?: string;               // tooltip
  variant?: Variant;
  size?: Size;
  onlyIcon?: boolean;
  iconProps?: Omit<
    React.ComponentProps<typeof Icon>,
    "name" | "className"
  >; // para pasar fill/weight/etc al icono
};

export const IconButton = ({
  icon,
  label,
  title,
  variant = "outline",
  size = "sm",
  className = "",
  onlyIcon = false,
  iconProps,
  ...rest
}: IconButtonProps) => {
  const base =
    "inline-flex items-center gap-1 rounded-md border transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-50";
  const sizes = size === "sm" ? "px-2 py-1 text-sm" : "px-3 py-1.5 text-sm";
  const variants: Record<Variant, string> = {
    outline: "bg-white hover:bg-gray-50 border-gray-300 text-gray-800",
    ghost: "bg-transparent hover:bg-gray-50 border-transparent text-gray-700",
    solid: "bg-gray-800 border-gray-800 text-white hover:opacity-95",
    primary: "bg-indigo-600 border-indigo-600 text-white hover:opacity-95",
    danger: "bg-rose-600 border-rose-600 text-white hover:opacity-95",
  };

  const tooltip = title ?? label;

  return (
    <button
      type="button"
      title={tooltip}
      aria-label={label}
      className={`${base} ${sizes} ${variants[variant]} ${className}`}
      {...rest}
    >
      <Icon
        name={icon}
        aria-hidden="true"
        {...iconProps} // ej: { fill: 0, weight: 400 }
      />
      {onlyIcon ? null : <span className="hidden sm:inline">{label}</span>}
    </button>
  );
};
