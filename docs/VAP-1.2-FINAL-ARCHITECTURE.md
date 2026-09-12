# VAP 1.2 FINAL — Central JARVIS Architecture

VAP 1.2 is the baseline before the more ambitious VAP 2 concept.

## One brain
VAP Center + Supabase are the source of truth. Chrome, PC, mobile and future wearable branches are bodies/interfaces.

## Core capabilities
- Central conversations
- Central tasks/reminders
- Startup notifications
- Periodic heartbeat
- Action relay queue
- Vault capture
- Sketch/whiteboard
- Think/Research/Create/Plan/Organize/Execute/Watch/VERTEX modes
- Voice input/output
- Wake phrase while panel is actively open
- Site permission center
- Remote-device architecture
- VERTEX website/admin-panel integration contract

## Action lifecycle
`request → reason → permission → queue → target device → execute → result → central activity`

VAP must never say an external action succeeded until a device/backend reports success.

## Canva example
“VAP, open Canva and create a VERTEX poster…”

VAP should identify Canva as the target tool, select an authorized device, queue the work, open Canva, execute through a secure browser-agent/tool bridge, and report blockers. The current Chrome package includes the central action queue and safe navigation primitives; full dynamic Canva editing requires a site-specific automation/tool bridge because ChatGPT-connected Canva tools are not directly callable from a Chrome extension.

## Website example
“VAP, publish my recent project to the VERTEX website…”

VAP should use the central project/asset records, generate/draft copy, ask for publishing confirmation unless trusted auto permission exists, queue website actions, and record the final result centrally.

## Wearable
Future VAP wearable can be:
`Bluetooth earbuds → phone gateway → VAP Central → response → earbuds`.
The wearable is another body, not another brain.

## Proactivity
Events may include reminder due, task overdue, device offline, action failed, project inactivity, new central activity and update availability. Proactive notifications must be useful and permission-aware.

## Self-update
A manually loaded unpacked Chrome extension cannot silently replace itself. A real update channel is required for self-updating builds.
