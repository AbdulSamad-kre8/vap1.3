# VAP 2.0 Final Architecture & Build Plan

## Principle

**One brain. Many bodies.**

VAP Center remains the source of truth for memory, conversations, tasks, reminders, projects, permissions, identity and decision context. Chrome is a controlled body.

## Proactive behavior

The browser body should be able to:

- announce startup reminders;
- periodically check central reminders;
- heartbeat every five minutes;
- report important browser events;
- surface future central notifications/actions when the backend exposes a secure sync contract;
- never fabricate an event or completed action.

## Wake behavior

Use three levels:

1. Click-to-talk — always reliable when supported.
2. Keyboard shortcut — opens VAP quickly.
3. Wake phrase while panel is open — explicit microphone mode.

A future native/managed voice service could provide true background wake-word detection if desired, but it must preserve visible microphone state and privacy controls.

## Action engine required for full JARVIS behavior

The central backend should eventually add:

- `vertex_pa_actions`
- action status: queued/running/completed/failed/cancelled
- target device
- permission requirement
- payload JSON
- result JSON
- timestamps
- idempotency key
- retry count

Device branches should claim only actions targeted to them, execute permitted actions, and report exact results.

## Tool bridge

For Canva/Higgsfield/social/email integrations, VAP should have a secure tool layer rather than attempting to expose secrets to Chrome. A tool call should have:

`intent → permission check → tool selection → execution → result → activity`

High-risk actions such as sending, publishing, deleting or submitting should default to confirmation.

## Vault

The eventual central Vault record should preserve:

- title
- URL
- source type
- category
- user's reason for saving
- extracted context
- created date
- related project
- related task
- tags
- optional screenshot/attachment reference

Chrome must never maintain a competing local Vault.

## Think mode

Think should use central context first:

`current page/context + active tasks + projects + relevant memories + permissions + available tools + time constraints → recommendation → optional action plan`

It should not claim it executed anything unless an action result exists.

## Daily assistant behavior

Useful commands:

- “VAP, what should I do today?”
- “VAP, what did I leave unfinished yesterday?”
- “VAP, remind me.”
- “VAP, remember why I saved this.”
- “VAP, think.”
- “VAP, organize my tasks.”
- “VAP, prepare this for VERTEX.”

## Remote PC

Install a second VAP branch on the target PC. Register it as a separate central device. The user can then request:

`VAP, on Abdul PC open Instagram and prepare this message.`

Central VAP chooses the device, verifies permission, queues the action, target PC claims it, executes it, and reports the result.

## Self-update

For extension updates, use a hosted Chrome extension distribution/update path. An unpacked developer build cannot self-replace safely. The branch can still report its version and notify the central system when a newer approved version is available.
