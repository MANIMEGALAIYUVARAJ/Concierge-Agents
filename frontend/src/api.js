// =============================
// Univ-Assist Frontend API Helper
// =============================

const BASE_URL = "http://localhost:8000/api";

/* ---------- GET ---------- */
export async function apiGet(path) {
  try {
    const res = await fetch(`${BASE_URL}${path}`);
    if (!res.ok) throw new Error(`GET ${path} failed`);
    return await res.json();
  } catch (err) {
    console.error("API GET Error:", err);
    return { error: true, message: err.message };
  }
}

/* ---------- POST ---------- */
export async function apiPost(path, body = {}) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`POST ${path} failed`);
    return await res.json();
  } catch (err) {
    console.error("API POST Error:", err);
    return { error: true, message: err.message };
  }
}

/* ---------- PATCH ---------- */
export async function apiPatch(path, body = {}) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(`PATCH ${path} failed`);
    return await res.json();
  } catch (err) {
    console.error("API PATCH Error:", err);
    return { error: true, message: err.message };
  }
}

/* ---------- DELETE (Optional) ---------- */
export async function apiDelete(path) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`DELETE ${path} failed`);
    return await res.json();
  } catch (err) {
    console.error("API DELETE Error:", err);
    return { error: true, message: err.message };
  }
}

/* ---------- Special — CHAT V2 ---------- */
export async function apiChat(message, mode = "default") {
  try {
    const res = await fetch(`${BASE_URL}/chat_v2`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, mode })
    });
    if (!res.ok) throw new Error("Chat API failed");
    return await res.json();
  } catch (err) {
    console.error("Chat Error:", err);
    return { reply: "Error connecting to Assist AI 😢" };
  }
}
