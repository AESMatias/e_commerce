import type { ServiceIconName } from "@/types/catalog";

const paths: Record<ServiceIconName, string[]> = {
  globe: ["M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18", "M3 12h18", "M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18"],
  cart: ["M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.76L20.5 8H6.2", "M9 20h.01", "M18 20h.01"],
  bot: ["M7 8h10a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3", "M12 4v4", "M9 14h.01", "M15 14h.01"],
  code: ["M8 8l-4 4 4 4", "M16 8l4 4-4 4", "M14 4l-4 16"],
  chart: ["M4 4v16h16", "M8 15l4-4 3 3 5-6"],
};

type ServiceIconProps = {
  name: ServiceIconName;
  size?: number;
};

export function ServiceIcon({ name, size = 22 }: ServiceIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {paths[name].map((d) => (
        <path
          key={d}
          d={d}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
