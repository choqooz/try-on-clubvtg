/**
 * Mock database of available garments.
 */

export interface Garment {
  id: string;
  name: string;
  description: string;
  previewUrl: string;
  assetUrl: string;
}

export const garments: Garment[] = [
  {
    id: "garm_1",
    name: "Classic White T-Shirt",
    description: "A timeless, comfortable white t-shirt perfect for casual wear.",
    previewUrl: "/static/img-1.jpg",
    assetUrl: "/static/img-1.jpg",
  },
  {
    id: "garm_2",
    name: "Denim Jacket",
    description: "Vintage style blue denim jacket with a relaxed, oversized fit.",
    previewUrl: "/static/img-2.webp",
    assetUrl: "/static/img-2.webp",
  },
  {
    id: "garm_3",
    name: "Linen Summer Shirt",
    description: "Lightweight linen shirt ideal for warm weather and beach days.",
    previewUrl: "/static/img-3.jpg",
    assetUrl: "/static/img-3.jpg",
  },
  {
    id: "garm_4",
    name: "New Garment",
    description: "A sleek, modern wardrobe essential with a contemporary silhouette.",
    previewUrl: "/static/img-4.jpeg",
    assetUrl: "/static/img-4.jpeg",
  },
];

export function getGarmentById(id: string): Garment | undefined {
  return garments.find((g) => g.id === id);
}
