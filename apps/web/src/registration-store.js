const API_BASE =
  import.meta.env.VITE_API_URL?.trim() || (import.meta.env.DEV ? "/api" : null);

function requireApi() {
  if (!API_BASE) {
    throw new Error(
      "등록 서버가 연결되지 않았어요. 잠시 후 다시 시도해주세요.",
    );
  }
  return API_BASE.replace(/\/$/, "");
}

function toProduct(item) {
  const base = requireApi();
  return {
    ...item,
    price: Number(item.pricePerDay),
    area: "서농동",
    distance: "직거래 장소 협의",
    size: item.gender === "남" ? "남성" : "여성",
    brand: "우리 동네 옷장",
    tag: item.occasions[0],
    imageUrl: base.startsWith("http")
      ? new URL(item.photoUrl, base).href
      : item.photoUrl,
    registered: true,
  };
}

export async function loadRegistered() {
  const response = await fetch(`${requireApi()}/clothes`);
  if (!response.ok) throw new Error("등록된 옷을 불러오지 못했어요.");
  return (await response.json()).map(toProduct);
}

export async function saveRegistered(data, photo) {
  const body = new FormData();
  body.append("data", JSON.stringify(data));
  body.append("photo", photo);
  const response = await fetch(`${requireApi()}/clothes`, {
    method: "POST",
    body,
  });
  if (!response.ok) {
    let message = "등록하지 못했어요. 입력값과 서버 상태를 확인해주세요.";
    try {
      const error = await response.json();
      message = error.detail || error.message || message;
    } catch {}
    throw new Error(message);
  }
  return toProduct(await response.json());
}

export const isRegistrationAvailable = Boolean(API_BASE);
