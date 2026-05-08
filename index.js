const truncate = (text, maxLength) => {
  if (!text) return ""
  return text.length <= maxLength ? text : `${text.slice(0, maxLength - 3)}...`
}

const extractTextFromParts = (parts = []) => {
  return parts
    .filter((part) => part.type === "text" && part.text)
    .map((part) => part.text)
    .join(" ")
}

export const GhosttyNotificationsPlugin = async ({ $, client }) => {
  const forceEnabled = process.env.OPENCODE_GHOSTTY_NOTIFICATIONS_FORCE === "1"
  const isGhostty = process.env.TERM_PROGRAM === "ghostty" || Boolean(process.env.GHOSTTY_RESOURCES_DIR)

  if (!forceEnabled && (!isGhostty || process.env.WARP_CLI_AGENT_PROTOCOL_VERSION)) return {}

  const terminalAppName = process.env.OPENCODE_GHOSTTY_APP_NAME || "Ghostty"
  const terminalProcessName = process.env.OPENCODE_GHOSTTY_PROCESS_NAME || "ghostty"
  const windowTitlePrefix = process.env.OPENCODE_GHOSTTY_TITLE_PREFIX || "OC | "

  return {
    event: async ({ event }) => {
      if (event.type !== "session.idle") return

      const sessionId = event.properties?.sessionID
      let sessionTitle = "opencode"
      let prompt = ""
      let response = ""

      if (sessionId) {
        try {
          const session = await client.session.get({
            path: { id: sessionId },
          })
          sessionTitle = session.data?.title || sessionTitle

          const result = await client.session.messages({
            path: { id: sessionId },
          })
          const messages = result.data || []
          const reversed = [...messages].reverse()
          const lastUser = reversed.find((message) => message.info?.role === "user")
          const lastAssistant = reversed.find((message) => message.info?.role === "assistant")

          prompt = truncate(extractTextFromParts(lastUser?.parts), 140)
          response = truncate(extractTextFromParts(lastAssistant?.parts), 180)
        } catch {
          // Keep notification working even if session metadata cannot be read.
        }
      }

      const script = `
on run argv
  set notificationTitle to item 1 of argv
  set notificationBody to item 2 of argv
  set targetSessionTitle to item 3 of argv
  set terminalAppName to item 4 of argv
  set terminalProcessName to item 5 of argv
  set windowTitlePrefix to item 6 of argv
  set targetWindowTitle to windowTitlePrefix & targetSessionTitle

tell application "System Events"
  set frontApp to name of first application process whose frontmost is true
end tell

set shouldNotify to true
set activeTerminalTitle to ""

try
  tell application terminalAppName to set activeTerminalTitle to name of front window
end try

if (frontApp is terminalAppName or frontApp is terminalProcessName) and (activeTerminalTitle is targetWindowTitle or activeTerminalTitle contains targetSessionTitle) then
  set shouldNotify to false
end if

if shouldNotify then
  display notification notificationBody with title notificationTitle subtitle targetWindowTitle
end if

end run
`

      const title = prompt ? `'${prompt}' finished` : "opencode finished"
      const body = response ? `Latest output: ${response}` : "Latest output: Response ready"

      await $`osascript -e ${script} ${title} ${body} ${sessionTitle} ${terminalAppName} ${terminalProcessName} ${windowTitlePrefix}`
    },
  }
}

export const NotificationPlugin = GhosttyNotificationsPlugin
