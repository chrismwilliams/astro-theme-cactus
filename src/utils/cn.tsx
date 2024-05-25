/* eslint-disable perfectionist/sort-objects */
   // eslint-disable-next-line perfectionist/sort-named-imports
   import { clsx, type ClassValue } from "clsx";
   import { twMerge } from "tailwind-merge";

   export function cn(...inputs: ClassValue[]) {
     return twMerge(clsx(inputs));
   }

   export function formatDate(input: number | string): string {
     const date = new Date(input);
     return date.toLocaleDateString("en-US", {
       month: "long",
       day: "numeric",
       year: "numeric",
     });
   }

   export function absoluteUrl(path: string) {
     // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
     return `${import.meta.env.PUBLIC_APP_URL}${path}`;
   }