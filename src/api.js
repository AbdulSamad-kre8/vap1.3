const VAP_ENDPOINT = "https://ibnmohapfeogfpxemaaz.supabase.co/functions/v1/vap-device";
const VAP_MISSION_ENDPOINT = "https://ibnmohapfeogfpxemaaz.supabase.co/functions/v1/vap-mission";

export async function getConfig() {
  return await chrome.storage.local.get({
    deviceToken: "", deviceName: "VAP Chrome", conversationId: "",
    notificationsEnabled: true, autoSpeak: true, automationMode: "ask",
    wakeMode: false, wakePhrase: "vap", proactiveMode: true,
    actionPolling: true, pairingCode: ""
  });
}

async function pairWithCode(pairingCode) {
  const code = String(pairingCode || "").trim();
  if (!code) throw new Error("VAP Chrome is not paired. Enter a one-time VAP pairing code in Settings.");
  const response = await fetch(VAP_ENDPOINT, {
    method: "POST", headers: {"Content-Type":"application/json"},
    body: JSON.stringify({kind:"pair", pairingCode:code})
  });
  let body = {}; try { body = await response.json(); } catch {}
  if (!response.ok || body?.error || !body?.deviceToken) {
    const e = new Error(body?.error || `VAP pairing failed with HTTP ${response.status}.`);
    e.status = response.status; e.body = body; throw e;
  }
  await chrome.storage.local.set({deviceToken:body.deviceToken, deviceName:body.deviceName || "VAP Chrome", pairingCode:""});
  return body;
}

async function ensureToken() {
  const config = await getConfig();
  if (config.deviceToken) return config.deviceToken;
  if (config.pairingCode) return (await pairWithCode(config.pairingCode)).deviceToken;
  throw new Error("VAP Chrome is not paired. Open VAP Settings and enter the one-time pairing code.");
}

async function requestWithRepair(endpoint, payload) {
  let token = await ensureToken();
  let response = await fetch(endpoint, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({deviceToken:token,...payload})});
  let body={}; try{body=await response.json()}catch{}
  if (response.status === 401 && !String(payload.kind||"").includes("pair")) {
    const config = await getConfig();
    if (config.pairingCode) {
      token = (await pairWithCode(config.pairingCode)).deviceToken;
      response = await fetch(endpoint, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({deviceToken:token,...payload})});
      body={}; try{body=await response.json()}catch{}
    }
  }
  if(!response.ok||body?.error){const e=new Error(body?.error||`VAP backend request failed with HTTP ${response.status}.`);e.status=response.status;e.body=body;throw e;}
  return body;
}

async function post(payload) { return requestWithRepair(VAP_ENDPOINT,payload); }

export async function createMission(message, metadata = {}) {
  return requestWithRepair(VAP_MISSION_ENDPOINT,{message,metadata});
}

export const heartbeat = (metadata = {}) => post({kind: "heartbeat", status: "online", metadata});
export const reportEvent = (message, metadata = {}) => post({kind: "event", message, status: "online", metadata});
export const askVap = (message, metadata = {}) => post({kind: "ask", message, status: "busy", metadata});
export const syncVap = (metadata = {}) => post({kind: "sync", status: "online", metadata});
export const pollActions = (metadata = {}) => post({kind: "poll_actions", status: "online", metadata});
export const startupReminders = (metadata = {}) => post({kind: "startup", status: "online", metadata});
export const ackReminder = (reminderId, metadata = {}) => post({kind: "ack_reminder", status: "online", metadata:{...metadata, reminder_id:reminderId}});
export const saveVault = (metadata = {}) => post({kind: "vault_save", status: "online", metadata});
export const getMission = (missionId) => post({kind: "mission_get", status: "online", metadata:{mission_id:missionId}});
export const completeAction = (actionId, result, status = "completed", metadata = {}) => post({
  kind: "complete_action", status: "online", metadata:{...metadata, action_id:actionId, result, action_status:status}
});
