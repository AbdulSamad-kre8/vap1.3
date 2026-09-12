# VAP Chrome 1.3.0 — MISSION ENGINE BASELINE

VAP Chrome is a branch/body of the single central VAP brain. It is not a separate chatbot or local task/memory system.

## Included
- Central VAP connection through `vap-device`
- Central conversation continuity + New Conversation
- Central reminder/task creation routing
- Startup reminder notifications
- Periodic heartbeat
- Action relay polling
- Safe browser action primitives (`open_url`, `navigate`, `new_tab`, `focus_tab`)
- Voice input/output
- Wake phrase while the VAP panel is actively open
- Current-page context
- Ask / Save / Think context menus
- VAP Vault capture flow
- Sketch/whiteboard
- Think / Research / Create / Plan / Organize / Execute / Watch / VERTEX modes
- Per-site permissions for Instagram, WhatsApp Web, Gmail, Canva and Higgsfield
- Automation mode: ask / auto / off
- VERTEX website/admin-panel integration contract
- Supabase migration for central action relay + Vault

## Critical central-sync rule
If VAP reports that it created a task or reminder, the central record must exist in Supabase first. Chrome must not create a Chrome-only task/reminder database.

## Real execution rule
VAP separates understanding, suggestion, action and result. It never claims an external action succeeded until the target branch/tool reports success.

## Canva
The extension can securely route Canva work and open Canva through the action relay. Full dynamic poster creation/editing requires a real site automation/tool bridge. The extension cannot directly invoke ChatGPT's connected Canva tool from a Supabase Edge Function.

## VERTEX website
A starter admin-panel integration contract is included in `vertex-web/`. The live VERTEX website source was not supplied, so the package does not falsely claim to have modified the production site.

## Security
- Never place Gemini keys in the extension.
- Never put Supabase service-role/secret keys in the extension or website frontend.
- Use the existing device-token authentication.
- External side effects such as publish/send/delete should require confirmation unless trusted auto permission is explicitly enabled.
- Do not bypass logins, CAPTCHAs, paywalls or website security.

## Install
1. Extract the ZIP.
2. Open `chrome://extensions`.
3. Enable Developer mode.
4. Load unpacked → select `vap-chrome`.
5. Open VAP settings and enter the private token for the existing `VAP Chrome` device.

## Backend files
`backend/supabase/migrations/20260911_vap12_action_relay.sql` adds the central action queue and Vault table.
`backend/supabase/functions/vap-device/index.ts` documents the VAP 1.2 backend contract extension. Merge/deploy it with your current v8 logic after review rather than blindly replacing production behavior.

## Limitations
- A normal MV3 extension cannot guarantee a hidden always-on wake word.
- A manually loaded unpacked extension cannot silently self-update.
- Full cross-PC control requires a VAP branch on the target PC.
- Full Canva/Instagram/WhatsApp/Gmail execution requires site-specific automation/tool integrations and permissions.


## VAP 1.3 Mission Engine
Multi-step requests can now become durable central missions with ordered steps in Supabase. The Chrome interface is unchanged. The mission layer is deliberately separate from the existing device brain so normal fast chat remains fast. External publishing/sending still requires an authorized tool/branch and confirmation unless trusted automation is enabled.


## VAP Master 1.3.3
This package is the consolidated Chrome branch plus deployable Supabase functions/migrations. Pair Chrome from VAP Center using a 10-minute one-time code. Full Canva/Instagram/n8n/browser UI automation is intentionally not falsely reported as complete until the browser agent bridge exists.
