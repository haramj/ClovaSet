import { authHeaders, requireApi } from "./registration-store";

async function json(response) {
  if (!response.ok) {
    let message = "채팅을 불러오지 못했어요. 잠시 후 다시 시도해주세요.";
    try {
      const error = await response.json();
      message = error.detail || error.message || message;
    } catch {}
    throw new Error(message);
  }
  return response.json();
}

export async function loadChats() {
  return json(await fetch(`${requireApi()}/chats`, { headers: authHeaders() }));
}

export async function loadChat(id) {
  return json(
    await fetch(`${requireApi()}/chats/${id}`, { headers: authHeaders() }),
  );
}

export async function createChat(data) {
  return json(
    await fetch(`${requireApi()}/chats`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  );
}

export async function sendChatMessage(id, body) {
  return json(
    await fetch(`${requireApi()}/chats/${id}/messages`, {
      method: "POST",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    }),
  );
}
