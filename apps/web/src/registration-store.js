const API_BASE =
  import.meta.env.VITE_API_URL?.trim() || (import.meta.env.DEV ? "/api" : null);
const CODE_KEY = "clovaset:demo-access-code";
const PARTICIPANT_KEY = "clovaset:participant-token";
const NAME_KEY = "clovaset:display-name";
export const isDemoAuthRequired =
  import.meta.env.VITE_DEMO_ACCESS_REQUIRED === "true";

export function hasDemoAccessCode() {
  return Boolean(sessionStorage.getItem(CODE_KEY));
}

export function setDemoAccessCode(code) {
  if (code) sessionStorage.setItem(CODE_KEY, code.trim());
  else sessionStorage.removeItem(CODE_KEY);
}

export function participantToken() {
  let token = localStorage.getItem(PARTICIPANT_KEY);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(PARTICIPANT_KEY, token);
  }
  return token;
}

export function getDisplayName() {
  return localStorage.getItem(NAME_KEY) || "";
}

export function setDisplayName(name) {
  localStorage.setItem(NAME_KEY, name.trim());
}

export function authHeaders() {
  const headers = { "X-Participant-Token": participantToken() };
  if (isDemoAuthRequired) {
    const code = sessionStorage.getItem(CODE_KEY);
    if (!code) throw new Error("시연 접속 코드를 입력해주세요.");
    headers["X-Demo-Code"] = code;
  }
  return headers;
}

export function requireApi() {
  if (!API_BASE) {
    throw new Error(
      "등록 서버가 연결되지 않았어요. 잠시 후 다시 시도해주세요.",
    );
  }
  return API_BASE.replace(/\/$/, "");
}

async function toProduct(item) {
  const base = requireApi();
  const photoUrl = base.startsWith("http")
    ? new URL(item.photoUrl, base).href
    : item.photoUrl;
  let imageUrl = photoUrl;
  if (isDemoAuthRequired) {
    const response = await fetch(photoUrl, { headers: authHeaders() });
    if (!response.ok) throw new Error("등록 사진을 불러오지 못했어요.");
    imageUrl = URL.createObjectURL(await response.blob());
  }
  return {
    ...item,
    price: Number(item.pricePerDay),
    area: "서농동",
    distance: "직거래 장소 협의",
    size: item.gender === "남" ? "남성" : "여성",
    brand: "우리 동네 옷장",
    tag: item.occasions[0],
    imageUrl,
    registered: true,
  };
}

export async function loadRegistered() {
  const response = await fetch(`${requireApi()}/clothes`, {
    headers: authHeaders(),
  });
  if (response.status === 401)
    throw new Error("시연 접속 코드를 확인해주세요.");
  if (!response.ok) throw new Error("등록된 옷을 불러오지 못했어요.");
  return Promise.all((await response.json()).map(toProduct));
}

export async function saveRegistered(data, photo) {
  const body = new FormData();
  body.append("data", JSON.stringify(data));
  body.append("photo", photo);
  const response = await fetch(`${requireApi()}/clothes`, {
    method: "POST",
    body,
    headers: authHeaders(),
  });
  if (!response.ok) {
    let message = "등록하지 못했어요. 입력값과 서버 상태를 확인해주세요.";
    try {
      const error = await response.json();
      message = error.detail || error.message || message;
    } catch {}
    throw new Error(message);
  }
  return await toProduct(await response.json());
}

export const isRegistrationAvailable = Boolean(API_BASE);
