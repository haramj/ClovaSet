export const OCCASIONS = {
  격식: ["레스토랑", "장례", "결혼하객", "면접"],
  파티: ["클럽", "패션쇼", "페스티벌", "콘서트", "기타"],
  일상: ["산책", "데이트", "카페", "운동", "기타"],
};

export function filterProducts(
  products,
  { category, occasion, savedOnly, saved, area, search },
) {
  const query = search.trim();
  return products.filter((product) => {
    const occasions = product.occasions || [];
    return (
      (category === "전체" || product.category === category) &&
      (!occasion || occasions.includes(occasion)) &&
      (!savedOnly || saved.includes(product.id)) &&
      (area === "전체 동네" || product.area === area) &&
      `${product.name} ${product.category} ${product.tag || ""} ${occasions.join(" ")}`.includes(
        query,
      )
    );
  });
}
