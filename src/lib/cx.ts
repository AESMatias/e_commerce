type ClassValue = string | false | null | undefined;

/** Joins CSS Module class names, skipping falsy values. */
export function cx(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
