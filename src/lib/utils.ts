import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function createWhatsAppProductUrl(productName: string, priceDisplay?: string): string {
  const text = encodeURIComponent(
    `Hi Mokova3D! I'm interested in "${productName}" (${priceDisplay || "Price Enquiry"}). Could you share available colours, delivery timeline for Delhi NCR, and final price?`
  );
  return `https://wa.me/918527373680?text=${text}`;
}

export function createWhatsAppHaggleUrl(
  productName: string,
  proposedPrice: number,
  quantity: number,
  rationale?: string
): string {
  const text = encodeURIComponent(
    `Hi Mokova3D! I saw "${productName}" on your site. I'd like to make an offer of ₹${proposedPrice} each for ${quantity} unit(s). Note: ${
      rationale || "Ready to order if confirmed!"
    }`
  );
  return `https://wa.me/918527373680?text=${text}`;
}