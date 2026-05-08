# opencode-ghostty-notifications

OpenCode plugin for macOS + Ghostty that sends a system notification when an OpenCode session finishes, while suppressing notifications only for the exact Ghostty window that owns that session.

This is useful when you run multiple OpenCode sessions at the same time. If session A finishes while you are focused on session B, you still get notified for session A.

## Features

- Notifies on OpenCode `session.idle`.
- Matches the finished OpenCode session against the active Ghostty window title.
- Suppresses notifications only when the matching OpenCode window is focused.
- Still notifies when you are in another Ghostty tab/window, another OpenCode session, or any other app.
- Uses the OpenCode session title and latest prompt/response in the notification.
- Automatically disables itself outside Ghostty, so it does not duplicate terminal-specific plugins such as Warp integrations.
- Uses macOS `osascript`; no extra dependency required.

## Requirements

- macOS
- Ghostty
- OpenCode
- Ghostty window titles that include the OpenCode session title, by default prefixed with `OC | `

## Installation

### Local plugin

Copy `index.js` into your OpenCode plugins directory:

```bash
mkdir -p ~/.config/opencode/plugins
cp index.js ~/.config/opencode/plugins/ghostty-notifications.js
```

Restart OpenCode.

OpenCode automatically loads local plugins from:

```text
~/.config/opencode/plugins/
```

### NPM-style config

If published to npm later, add it to `~/.config/opencode/opencode.json`:

```json
{
  "plugin": ["opencode-ghostty-notifications"]
}
```

## Configuration

You can customize behavior with environment variables:

```bash
export OPENCODE_GHOSTTY_APP_NAME="Ghostty"
export OPENCODE_GHOSTTY_PROCESS_NAME="ghostty"
export OPENCODE_GHOSTTY_TITLE_PREFIX="OC | "
export OPENCODE_GHOSTTY_NOTIFICATIONS_FORCE="0"
```

Defaults are shown above.

By default, the plugin only runs when OpenCode was launched from Ghostty. Set `OPENCODE_GHOSTTY_NOTIFICATIONS_FORCE=1` to bypass that guard for testing.

## How It Works

The plugin listens for OpenCode `session.idle` events. When a session finishes, it fetches the session title and recent messages using the OpenCode client API.

Notifications use the same concise shape as terminal-native agent notifications:

```text
'<latest prompt>' finished
Latest output: <latest assistant output>
```

At startup, it checks Ghostty-specific environment variables such as `TERM_PROGRAM=ghostty` and `GHOSTTY_RESOURCES_DIR`. If OpenCode is running in another terminal, the plugin returns without installing hooks.

It then asks macOS which app is frontmost and reads Ghostty's front window title. The expected Ghostty title is built from `OPENCODE_GHOSTTY_TITLE_PREFIX` plus the OpenCode session title.

If the focused Ghostty window matches the session that just finished, it does nothing. If another OpenCode session or another Ghostty window is focused, it sends a macOS notification.

## Permissions

macOS may ask for Automation or notification permissions for `osascript`. Allow them for notifications to work.

## License

MIT
