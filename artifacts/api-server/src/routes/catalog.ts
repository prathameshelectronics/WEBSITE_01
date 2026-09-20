import { Router, type IRouter } from "express";
import {
  GetProductBySlugParams,
  GetProductBySlugResponse,
  GetStorefrontHomeResponse,
  ListCategoriesResponse,
  ListDealsResponse,
  ListProductsQueryParams,
  ListProductsResponse,
} from "@workspace/api-zod";
import { brands, categories, deals, products } from "./catalog-data";

const router: IRouter = Router();

router.get("/storefront/home", (_req, res) => {
  const data = GetStorefrontHomeResponse.parse({
    heroProducts: products.filter((product) => product.featured).slice(0, 3),
    featuredProducts: products.filter((product) => product.featured),
    categories,
    deals,
    brands,
  });
  res.json(data);
});

router.get("/products", (req, res) => {
  const query = ListProductsQueryParams.parse(req.query);
  const normalizedQuery = query.q?.trim().toLowerCase();
  const filtered = products
    .filter((product) => {
      if (!normalizedQuery) return true;
      return [product.name, product.brand, product.categoryLabel, ...product.specs]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    })
    .filter((product) => !query.category || product.category === query.category)
    .slice(0, query.limit);

  res.json(ListProductsResponse.parse(filtered));
});

router.get("/products/:slug", (req, res) => {
  const params = GetProductBySlugParams.parse(req.params);
  const product = products.find((item) => item.slug === params.slug);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(GetProductBySlugResponse.parse(product));
});

router.get("/categories", (_req, res) => {
  res.json(ListCategoriesResponse.parse(categories));
});

router.get("/deals", (_req, res) => {
  res.json(ListDealsResponse.parse(deals));
});

export default router;