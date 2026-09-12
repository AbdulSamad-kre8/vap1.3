# VAP Master Build Contract

VAP is Abdul's personal JARVIS-style operating system. It is one central brain with multiple bodies/interfaces. The Chrome extension is a body, not a separate assistant.

## Non-negotiable baseline
- Preserve the existing VAP interface unless Abdul explicitly asks for a UI change.
- Central Supabase workspace is the source of truth for tasks, reminders, projects, memories, clients, missions, actions and Vault.
- Fast chat must stay fast. Simple requests use deterministic fast paths; multi-step work becomes a mission.
- Never claim an external action succeeded until the authorized branch/tool reports success.
- External side effects (send, publish, delete, purchase, submit) require confirmation unless an equivalent trusted auto permission is explicitly enabled.
- Never place Supabase service-role/secret credentials or AI provider secrets in a browser extension.

## Mission model
A mission is a durable multi-step goal. Each mission has ordered steps, a status, progress, current step, result and timestamps. Each step can later bind to an action/tool adapter.

## Target capabilities
1. Creative execution: choose the best available creative tool, create assets, inspect, revise and export.
2. Copy/content: captions, descriptions, platform variants and metadata.
3. Social operations: prepare -> approve -> publish -> verify -> report.
4. n8n automation: design workflow -> create/configure nodes -> connect credentials through user-authorized setup -> test -> activate.
5. VERTEX website: discover eligible projects -> prepare descriptions/assets -> create/update entries -> verify -> report URLs.
6. Browser/PC agent: execute authorized UI actions on the correct target device and return exact results.
7. File/asset management: locate, create, organize and associate files with missions/projects.
8. Proactive intelligence: unfinished-work review, next-action suggestions, weekly CEO review and reminders.
9. VAP Center: show mission progress in the same command-center interface.

## Example mission
User: "VAP, create a VERTEX poster, write the caption, prepare Instagram, and add the finished project to the VERTEX website."

Expected mission steps:
1. Create creative asset
2. Generate platform-ready copy
3. Prepare external publishing
4. Prepare and upload VERTEX project

The current 1.3 baseline creates the central mission and ordered steps without redesigning the interface. Tool adapters and true browser/creative execution are the next engineering layers.
