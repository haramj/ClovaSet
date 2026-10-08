import assert from "node:assert/strict";
import test from "node:test";
import { filterProducts } from "../apps/web/src/catalog-filters.js";

const products = [
  { id: 1, name: "하객 드레스", category: "격식", occasions: ["결혼하객", "레스토랑"], area: "서농동" },
  { id: 2, name: "면접 재킷", category: "격식", occasions: ["면접"], area: "서농동" },
  { id: 3, name: "파티 옷", category: "파티", occasions: ["기타"], area: "서농동" },
];
const filters = { category: "격식", occasion: "", savedOnly: false, saved: [], area: "전체 동네", search: "" };

test("filters registered clothes by any selected occasion", () => {
  assert.deepEqual(filterProducts(products, { ...filters, occasion: "레스토랑" }).map((item) => item.id), [1]);
  assert.deepEqual(filterProducts(products, { ...filters, occasion: "면접" }).map((item) => item.id), [2]);
});

test("keeps occasion filtering within the selected category", () => {
  assert.deepEqual(filterProducts(products, { ...filters, occasion: "기타" }), []);
  assert.deepEqual(filterProducts(products, { ...filters, category: "파티", occasion: "기타" }).map((item) => item.id), [3]);
});
