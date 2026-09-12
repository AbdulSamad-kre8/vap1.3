import { heartbeat, reportEvent, askVap, createMission, syncVap, getConfig, pollActions, completeAction, startupReminders, ackReminder as apiAckReminder, saveVault } from "./api.js";
import { getActivePageContext } from "./page-context.js";


function shouldCreateMission(message, mode){
  const s=String(message||"").toLowerCase();
  if(String(mode||"")==="chat") return false;
  const verbs=(s.match(/\b(create|make|build|design|generate|prepare|publish|upload|post|automate|setup|set up|organize|research)\b/g)||[]).length;
  return verbs>=2 || /\b(n8n|workflow|automation|social media|campaign|all my projects|upload .* website)\b/i.test(s);
}

const MENU_ASK = "vap-ask-page";
const MENU_SAVE = "vap-save-page";
const MENU_THINK = "vap-think-page";
const STARTUP = "startup";

chrome.runtime.onInstalled.addListener(async () => { await createContextMenus(); await safeHeartbeat("extension installed"); });
chrome.runtime.onStartup.addListener(async () => { await createContextMenus(); await safeHeartbeat("browser startup"); await checkStartupReminders(); });
chrome.action.onClicked.addListener(async tab => openVapPanel(tab?.windowId));
chrome.commands.onCommand.addListener(async command => {
  const [tab] = await chrome.tabs.query({active:true,lastFocusedWindow:true});
  if (command === "open-vap") await openVapPanel(tab?.windowId);
  if (command === "capture-to-vault" && tab?.id) {
    const context = await getActivePageContext(tab.id, "");
    await chrome.storage.session.set({pendingVapAction:{type:"save",context,createdAt:Date.now()}});
    await openVapPanel(tab.windowId);
  }
});

chrome.notifications.onClicked.addListener(async id => {
  if (!id.startsWith("vap-reminder-")) return;
  const reminderId = id.replace("vap-reminder-", "");
  try { await ackReminder(reminderId); } catch (e) { console.warn(e); }
  await openVapPanel();
  await chrome.notifications.clear(id);
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;
  try {
    const context = await getActivePageContext(tab.id, info.selectionText || "");
    const type = info.menuItemId === MENU_SAVE ? "save" : info.menuItemId === MENU_THINK ? "think" : "ask";
    await chrome.storage.session.set({pendingVapAction:{type,context,createdAt:Date.now()}});
    await openVapPanel(tab.windowId);
  } catch (e) { console.error("VAP context-menu error:", e); }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    switch (message?.type) {
      case "GET_ACTIVE_CONTEXT": {
        const [tab] = await chrome.tabs.query({active:true,lastFocusedWindow:true});
        if (!tab?.id) throw new Error("No active tab.");
        return await getActivePageContext(tab.id, message.selectedText || "");
      }
      case "ASK_VAP": {
        const metadata = {...(message.metadata || {}), branch:"chrome"};
        const result = shouldCreateMission(message.message, metadata.mode) ? await createMission(message.message, metadata) : await askVap(message.message, metadata);
        try { await reportEvent(metadata.action === "save" ? "Chrome • Saved webpage to VAP" : metadata.interaction === "voice" ? "Chrome • Voice request" : "Chrome • VAP request", metadata); } catch {}
        return result;
      }
      case "REPORT_EVENT": return await reportEvent(message.message, message.metadata || {});
      case "HEARTBEAT": return await heartbeat(message.metadata || {});
      case "GET_CONFIG": return await getConfig();
      case "SAVE_CONFIG": {
        const next = {
          deviceToken:String(message.deviceToken || "").trim(), pairingCode:String(message.pairingCode || "").trim(), deviceName:String(message.deviceName || "VAP Chrome").trim(),
          notificationsEnabled:message.notificationsEnabled !== false, autoSpeak:message.autoSpeak !== false,
          automationMode:["ask","auto","off"].includes(message.automationMode) ? message.automationMode : "ask",
          wakeMode:message.wakeMode === true, wakePhrase:String(message.wakePhrase || "vap").trim().toLowerCase() || "vap",
          proactiveMode:message.proactiveMode !== false, conversationId:String(message.conversationId || "").trim()
        };
        await chrome.storage.local.set(next); await safeHeartbeat("configuration saved"); return {ok:true, config:next};
      }
      case "NEW_CONVERSATION": await chrome.storage.local.set({conversationId:""}); return {ok:true};
      case "GET_PENDING_ACTION": { const x=await chrome.storage.session.get("pendingVapAction"); if(x.pendingVapAction) await chrome.storage.session.remove("pendingVapAction"); return x.pendingVapAction||null; }
      case "ACK_REMINDER": return await ackReminder(message.reminderId);
      case "SAVE_VAULT": return await saveVault(message.metadata || {});
      case "STARTUP_REMINDERS": return await checkStartupReminders();
      case "REQUEST_SITE_PERMISSION": return await requestSitePermission(String(message.site || ""));
      case "GET_SITE_PERMISSIONS": return await getSitePermissions();
      case "OPTIONAL_SYNC": return await optionalSync();
      case "POLL_ACTIONS": return await pollAndExecuteActions();
      default: throw new Error(`Unknown VAP message type: ${message?.type || "undefined"}`);
    }
  })().then(result=>sendResponse({ok:true,result})).catch(error=>sendResponse({ok:false,error:error?.message||String(error),status:error?.status}));
  return true;
});

async function openVapPanel(windowId) {
  if (!chrome.sidePanel?.open) return;
  let id=windowId;
  if (!id) { const [tab]=await chrome.tabs.query({active:true,lastFocusedWindow:true}); id=tab?.windowId; }
  if (id) { try { await chrome.sidePanel.open({windowId:id}); } catch(e) { console.warn("Could not open VAP panel:",e.message); } }
}

async function createContextMenus() {
  await chrome.contextMenus.removeAll();
  chrome.contextMenus.create({id:MENU_ASK,title:"Ask VAP about this",contexts:["page","selection","link"]});
  chrome.contextMenus.create({id:MENU_SAVE,title:"Save to VAP Vault",contexts:["page","selection","link"]});
  chrome.contextMenus.create({id:MENU_THINK,title:"Think about this with VAP",contexts:["page","selection","link"]});
}

const SITE_PERMISSIONS={
  instagram:["https://*.instagram.com/*"], whatsapp:["https://web.whatsapp.com/*"], gmail:["https://mail.google.com/*"],
  canva:["https://*.canva.com/*"], higgsfield:["https://*.higgsfield.ai/*"]
};
async function requestSitePermission(site){ const origins=SITE_PERMISSIONS[site]; if(!origins) throw new Error("Unknown site permission."); return {site,granted:await chrome.permissions.request({origins})}; }
async function getSitePermissions(){ const out={}; for(const [site,origins] of Object.entries(SITE_PERMISSIONS)) out[site]=await chrome.permissions.contains({origins}); return out; }

async function safeHeartbeat(reason){
  try { const config=await getConfig(); if(!config.deviceToken && !config.pairingCode) return; await heartbeat({branch:"chrome",deviceName:config.deviceName,reason,extensionVersion:chrome.runtime.getManifest().version}); }
  catch(e){ console.warn("VAP heartbeat failed:",e.message); }
}

async function checkStartupReminders(){
  try {
    const config=await getConfig(); if((!config.deviceToken && !config.pairingCode) || config.notificationsEnabled===false) return {reminders:[]};
    const data=await startupReminders({branch:"chrome",extensionVersion:chrome.runtime.getManifest().version});
    const reminders=data?.reminders||[];
    for(const r of reminders){ await chrome.notifications.create(`vap-reminder-${r.id}`,{type:"basic",iconUrl:"icon128.png",title:"VAP reminder",message:r.title||"You asked VAP to remind you about something.",priority:2,requireInteraction:true}); }
    return {reminders};
  } catch(e){ console.warn("Startup reminder check failed:",e.message); return {reminders:[],error:e.message}; }
}
async function ackReminder(reminderId){
  const config=await getConfig(); if(!config.deviceToken && !config.pairingCode) return {ok:false};
  return await apiAckReminder(reminderId,{branch:"chrome"});
}

async function optionalSync(){
  try { return await syncVap({branch:"chrome",extensionVersion:chrome.runtime.getManifest().version}); }
  catch(e){ return {ok:false,unsupported:true,error:e.message}; }
}

chrome.alarms.create("vap-heartbeat",{periodInMinutes:5});
chrome.alarms.create("vap-startup-reminder-check",{periodInMinutes:30});
chrome.alarms.create("vap-action-poll",{periodInMinutes:0.5});
chrome.alarms.onAlarm.addListener(async alarm=>{
  if(alarm.name==="vap-heartbeat") await safeHeartbeat("periodic heartbeat");
  if(alarm.name==="vap-startup-reminder-check") { const c=await getConfig(); if(c.proactiveMode!==false) await checkStartupReminders(); }
  if(alarm.name==="vap-action-poll") { const c=await getConfig(); if(c.actionPolling!==false && c.automationMode!=="off") await pollAndExecuteActions(); }
});


async function pollAndExecuteActions(){
  try {
    const config=await getConfig();
    if(!config.deviceToken || config.automationMode==="off") return {actions:[]};
    const data=await pollActions({branch:"chrome",extensionVersion:chrome.runtime.getManifest().version,automationMode:config.automationMode});
    const actions=Array.isArray(data?.actions)?data.actions:[];
    const results=[];
    for(const action of actions){
      if(config.automationMode!=="auto" && action.requires_confirmation!==false){
        results.push({id:action.id,status:"awaiting_confirmation"});
        continue;
      }
      const result=await executeAction(action);
      const finalStatus=result.execution_state==='needs_agent_bridge'?'failed':result.ok?'completed':'failed';
      await completeAction(action.id,result,finalStatus,{branch:"chrome",mission_id:action.payload?.mission_id,step_id:action.payload?.step_id});
      results.push({id:action.id,status:finalStatus,result});
    }
    return {actions:results};
  } catch(e){ console.warn("VAP action poll failed:",e.message); return {actions:[],error:e.message}; }
}

async function executeAction(action){
  const type=String(action.action_type||action.type||"");
  const payload=action.payload||{};
  try{
    if(type==="open_url" || type==="navigate"){
      const url=String(payload.url||"").trim();
      if(!/^https:\/\//i.test(url)) throw new Error("Only HTTPS navigation is allowed.");
      const tab=await chrome.tabs.create({url,active:true});
      return {ok:true,action:"open_url",tabId:tab.id,url};
    }
    if(type==="new_tab"){
      const tab=await chrome.tabs.create({active:true});
      return {ok:true,action:"new_tab",tabId:tab.id};
    }
    if(type==="focus_tab"){
      const tabId=Number(payload.tabId); if(!Number.isInteger(tabId)) throw new Error("Invalid tab id.");
      await chrome.tabs.update(tabId,{active:true});
      return {ok:true,action:"focus_tab",tabId};
    }
    if(type==="site_task"){
      const url=String(payload.url||"").trim();
      const instruction=String(payload.instruction||"").trim();
      if(url && /^https:\/\//i.test(url)) await chrome.tabs.create({url,active:true});
      // Full site automation needs the PC/browser agent bridge. Do not claim completion from merely opening a tab.
      return {ok:true,action:"site_task_opened",url,instruction,needs_agent_bridge:true,execution_state:"needs_agent_bridge",message:"Page opened. Full site automation still requires the VAP browser agent bridge."};
    }
    return {ok:false,error:`Unsupported Chrome action: ${type}`};
  }catch(e){ return {ok:false,error:e?.message||String(e)}; }
}
