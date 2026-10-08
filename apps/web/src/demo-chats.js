import { randomId } from "./random-id";

const DEMO_CHATS_KEY = "sharedclothes:demo-chats";
const LEGACY_REQUESTS_KEY = "sharedclothes:demo-requests";

export function demoTimestamp() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 19);
}

export function makeDemoChat(request, clothingName, id = randomId()) {
  const createdAt = demoTimestamp();
  const body = `안녕하세요! ${clothingName} 대여를 ${request.start}부터 ${request.end}까지 요청드려요. 예상 금액은 ${Number(request.total).toLocaleString("ko-KR")}원입니다. 가능할까요?`;
  return {
    chat: {
      id: `demo-${id}`,
      clothingName,
      ownerName: "시연용 이웃",
      requesterName: request.requesterName || "동네 이웃",
      start: request.start,
      end: request.end,
      total: request.total,
      role: "requester",
      demo: true,
      lastMessage: body,
      createdAt,
    },
    messages: [{ id: `demo-message-${id}`, mine: true, body, createdAt }],
  };
}

export function loadDemoChats() {
  try {
    const saved = JSON.parse(localStorage.getItem(DEMO_CHATS_KEY));
    if (Array.isArray(saved)) return saved;
    const oldRequests = JSON.parse(localStorage.getItem(LEGACY_REQUESTS_KEY));
    if (!Array.isArray(oldRequests)) return [];
    return oldRequests
      .filter((item) => item && item.name && item.start && item.end)
      .map((item) =>
        makeDemoChat(
          { ...item, requesterName: "동네 이웃" },
          item.name,
          item.id || randomId(),
        ),
      );
  } catch {
    return [];
  }
}

export function saveDemoChats(chats) {
  try {
    localStorage.setItem(DEMO_CHATS_KEY, JSON.stringify(chats));
  } catch {}
}
