# VAP 1.2 ↔ VERTEX Website Integration

## Goal
VERTEX website, VAP Center, Chrome, PC/mobile branches and future wearable must share the same central Supabase workspace.

The website must not create a second VAP database.

## Admin panel model
The VERTEX website admin panel should read/write approved VERTEX content tables through a secure server/API layer. VAP should be able to create/update content by placing an approved action in the central `vertex_pa_actions` queue.

Recommended actions:
- `website.project.create`
- `website.project.update`
- `website.project.publish`
- `website.project.unpublish`
- `website.content.draft_caption`
- `website.content.draft_description`
- `website.asset.attach`

Publishing is an external side effect: default to confirmation unless the user explicitly enables an equivalent trusted auto permission.

## Example command
“VAP, post my recent project to the VERTEX website. Use ChatGPT to create the best caption and description, then publish it.”

Desired flow:
1. VAP finds the most recent eligible project from the central VERTEX project/asset records.
2. VAP drafts caption + description.
3. VAP shows the draft for approval unless publishing auto-permission is enabled.
4. VAP queues website actions.
5. VERTEX admin panel/backend executes them.
6. Result is recorded centrally in activity + action result.

## Important
The actual VERTEX website source code was not part of this package, so this file is an integration contract rather than a claim that the live website was modified.
