// src/components/ui/Icon.tsx
import React from "react";
import { ICONS, type IconName } from "./icons";

export type IconStyle = "outlined" | "rounded" | "sharp";
export type IconProps = React.SVGAttributes<SVGSVGElement> & {
  name: string;
  styleSet?: IconStyle;
  fill?: 0 | 1;
  grade?: -25 | 0 | 200;
  opticalSize?: 20 | 24 | 40 | 48;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
};

export const Icon: React.FC<IconProps> = ({
  name,
  className = "",
  fill = 0,
  weight = 400,
  grade = 0,
  opticalSize = 24,
  styleSet: _styleSet,
  ...rest
}) => {
  const path = ICONS[name as IconName];
  if (!path) {
    console.warn(`[Icon] Icono desconocido: "${name}"`);
    return null;
  }

  const size = opticalSize ?? 24;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={`inline-block shrink-0 ${className}`}
      aria-hidden="true"
      {...rest}
    >
      <path d={path} />
    </svg>
  );
};
