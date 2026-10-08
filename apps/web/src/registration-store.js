const API_BASE =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "/api" : null);
const DB_NAME = "clovaset-demo-registration";
const STORE_NAME = "clothes";

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () =>
      request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function withStore(mode, action) {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, mode);
      const request = action(transaction.objectStore(STORE_NAME));
      transaction.oncomplete = () => resolve(request.result);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () =>
        reject(transaction.error || new Error("저장 공간을 사용할 수 없어요."));
    });
  } finally {
    db.close();
  }
}

function toProduct(item, photo) {
  return {
    ...item,
    price: Number(item.pricePerDay),
    area: "서농동",
    distance: "직거래 장소 협의",
    size: item.gender === "남" ? "남성" : "여성",
    brand: "우리 동네 옷장",
    tag: item.occasions[0],
    imageUrl:
      photo ||
      (API_BASE?.startsWith("http")
        ? new URL(item.photoUrl, API_BASE).href
        : item.photoUrl),
    registered: true,
  };
}

export async function loadRegistered() {
  if (API_BASE) {
    const response = await fetch(`${API_BASE}/clothes`);
    if (!response.ok) throw new Error("등록된 옷을 불러오지 못했어요.");
    return (await response.json()).map((item) => toProduct(item));
  }
  const items = await withStore("readonly", (store) => store.getAll());
  return items
    .reverse()
    .map((item) => toProduct(item, URL.createObjectURL(item.photo)));
}

export async function saveRegistered(data, photo) {
  if (API_BASE) {
    const body = new FormData();
    body.append("data", JSON.stringify(data));
    body.append("photo", photo);
    const response = await fetch(`${API_BASE}/clothes`, {
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
  const item = {
    ...data,
    id: `demo-${crypto.randomUUID()}`,
    photo,
    photoUrl: null,
  };
  await withStore("readwrite", (store) => store.put(item));
  return toProduct(item, URL.createObjectURL(photo));
}

export const isDemoStorage = !API_BASE;
