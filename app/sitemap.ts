import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://maemaelog.com",
      lastModified: new Date(),
    },
    {
      url: "https://maemaelog.com/trade",
      lastModified: new Date(),
    },
    {
      url: "https://maemaelog.com/stocks",
      lastModified: new Date(),
    },
    {
      url: "https://maemaelog.com/profit",
      lastModified: new Date(),
    },
  ];
}