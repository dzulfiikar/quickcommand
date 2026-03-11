import AppKit
import ApplicationServices
import Foundation

enum HelperFailure: Error, CustomStringConvertible {
  case invalidCommand
  case notTrusted
  case failedToOpenSettings

  var description: String {
    switch self {
    case .invalidCommand:
      return "Invalid command"
    case .notTrusted:
      return "Accessibility permission is required"
    case .failedToOpenSettings:
      return "Failed to open Accessibility settings"
    }
  }
}

do {
  let command = CommandLine.arguments.dropFirst().first ?? ""

  switch command {
  case "check-accessibility":
    print(AXIsProcessTrusted() ? "true" : "false")
  case "open-accessibility-settings":
    try openAccessibilitySettings()
    print("opened")
  case "paste":
    try performPaste()
    print("pasted")
  default:
    throw HelperFailure.invalidCommand
  }
} catch {
  fputs("\(error)\n", stderr)
  exit(1)
}

func openAccessibilitySettings() throws {
    let urls = [
      "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility",
      "x-apple.systempreferences:com.apple.settings.PrivacySecurity.extension?Privacy_Accessibility"
    ]

    for candidate in urls {
      if let url = URL(string: candidate), NSWorkspace.shared.open(url) {
        return
      }
    }

    let process = Process()
    process.executableURL = URL(fileURLWithPath: "/usr/bin/open")
    process.arguments = ["x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility"]
    try process.run()
    process.waitUntilExit()

    guard process.terminationStatus == 0 else {
      throw HelperFailure.failedToOpenSettings
    }
}

func performPaste() throws {
  guard AXIsProcessTrusted() else {
    throw HelperFailure.notTrusted
  }

  let source = CGEventSource(stateID: .combinedSessionState)
  let keyCodeV: CGKeyCode = 9

  guard
    let keyDown = CGEvent(keyboardEventSource: source, virtualKey: keyCodeV, keyDown: true),
    let keyUp = CGEvent(keyboardEventSource: source, virtualKey: keyCodeV, keyDown: false)
  else {
    throw HelperFailure.invalidCommand
  }

  keyDown.flags = .maskCommand
  keyUp.flags = .maskCommand

  keyDown.post(tap: .cghidEventTap)
  usleep(12_000)
  keyUp.post(tap: .cghidEventTap)
}
