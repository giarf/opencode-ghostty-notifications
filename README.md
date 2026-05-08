# opencode-ghostty-notifications

OpenCode plugin for macOS + Ghostty that sends a system notification when an OpenCode session finishes, but only when you are not focused on that exact OpenCode Ghostty window.

## Features

- Notifies on OpenCode `session.idle`.
- Suppresses notifications when the matching Ghostty OpenCode window is focused.
- Still notifies when you are in another Ghostty tab/window, another OpenCode session, Zen Browser, or any other app.
- Uses the OpenCode session title and latest prompt/response in the notification.
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
export OPENCODE_NOTIFICATION_TITLE_PREFIX="opencode finished"
```

Defaults are shown above.

## How It Works

The plugin listens for OpenCode `session.idle` events. When a session finishes, it fetches the session title and recent messages using the OpenCode client API.

It then asks macOS which app is frontmost and reads Ghostty's front window title. If the focused Ghostty window matches the session that just finished, it does nothing. Otherwise it sends a macOS notification.

## Permissions

macOS may ask for Automation or notification permissions for `osascript`. Allow them for notifications to work.

## License

MIT
