import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getImageUrl = (imageName: string | undefined) => {
  const fallbackSrc = "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070&auto=format&fit=crop";
  if (!imageName) return fallbackSrc;

  if (imageName.startsWith("http")) return imageName;

  let BASE_URL = "https://natrajhotels.obsidiansix.com";
  if (typeof window !== "undefined") {
    BASE_URL = window.location.origin;
  } else if (process.env.MAIN_URL) {
    BASE_URL = process.env.MAIN_URL;
  }

  const cleanBase = BASE_URL.replace(/\/$/, "");
  const cleanImage = imageName.replace(/^\//, "");
  
  if (cleanImage.includes("uploads/")) {
    return `${cleanBase}/${cleanImage}`;
  }
  
  return `/assets/rooms/${cleanImage}`;
};
