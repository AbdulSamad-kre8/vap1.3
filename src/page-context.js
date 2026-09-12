export async function getActivePageContext(tabId, selectionText="") {
  const tab=await chrome.tabs.get(tabId);
  let pageText="";
  try {
    const results=await chrome.scripting.executeScript({target:{tabId},func:()=>({text:document.body?.innerText||"",title:document.title,url:location.href})});
    const x=results?.[0]?.result||{}; pageText=String(x.text||"").slice(0,12000);
  } catch(e) { pageText=""; }
  return {url:tab?.url||"",title:tab?.title||"",pageText,selectionText:String(selectionText||"").slice(0,4000)};
}
