// src/components/ui/Icon.tsx
import React from "react";

export type IconStyle = "outlined" | "rounded" | "sharp";
export type IconProps = React.HTMLAttributes<HTMLSpanElement> & {
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
  styleSet = "outlined",
  fill = 0,
  grade = 0,
  opticalSize = 24,
  weight = 400,
  ...rest
}) => {
  const familyClass =
    styleSet === "rounded"
      ? "material-symbols-rounded"
      : styleSet === "sharp"
      ? "material-symbols-sharp"
      : "material-symbols-outlined";

  const style: React.CSSProperties = {
    fontVariationSettings: `'FILL' ${fill}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${opticalSize}`,
    lineHeight: 1,
  };

  return (
    <span className={`${familyClass} ${className}`} style={style} {...rest}>
      {name}
    </span>
  );
};
