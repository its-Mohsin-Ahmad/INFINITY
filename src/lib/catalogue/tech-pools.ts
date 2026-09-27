import type { ControlBinding, PlatformSlug } from "@/lib/types";
import type { PlayFamily } from "./guides";

/* ===========================================================================
 * Technical pools — control schemes.
 * Schemes are grouped by input device and family so the guide shown on a game
 * page always matches the device the player is actually holding.
 * ======================================================================== */

export type InputDevice = "keyboard" | "gamepad" | "touch";

const KB_SHOOTER: ControlBinding[] = [
  { action: "Move", key: "W A S D" },
  { action: "Sprint", key: "Shift" },
  { action: "Crouch / Slide", key: "Ctrl" },
  { action: "Jump / Vault", key: "Space" },
  { action: "Fire", key: "Left Mouse" },
  { action: "Aim / Scope", key: "Right Mouse" },
  { action: "Reload", key: "R" },
  { action: "Melee", key: "V" },
  { action: "Grenade / Utility", key: "G" },
  { action: "Interact", key: "F" },
  { action: "Ability 1 / 2", key: "Q / E" },
  { action: "Ultimate", key: "X" },
  { action: "Map / Scoreboard", key: "M / Tab" },
  { action: "Push to talk", key: "T" },
];

const KB_MELEE: ControlBinding[] = [
  { action: "Move", key: "W A S D" },
  { action: "Sprint", key: "Shift" },
  { action: "Light attack", key: "Left Mouse" },
  { action: "Heavy attack", key: "Right Mouse" },
  { action: "Dodge / Roll", key: "Space" },
  { action: "Block / Parry", key: "Q" },
  { action: "Ability / Spell", key: "E" },
  { action: "Use item", key: "R" },
  { action: "Lock target", key: "Middle Mouse" },
  { action: "Interact", key: "F" },
  { action: "Inventory", key: "I" },
  { action: "Quest journal", key: "J" },
  { action: "Map", key: "M" },
  { action: "Walk / sprint toggle", key: "Caps Lock" },
];

const KB_RACING: ControlBinding[] = [
  { action: "Steer", key: "A / D" },
  { action: "Throttle", key: "W" },
  { action: "Brake / Reverse", key: "S" },
  { action: "Handbrake", key: "Space" },
  { action: "Gear up / down", key: "Shift / Ctrl" },
  { action: "Clutch", key: "Left Alt" },
  { action: "Look back", key: "B" },
  { action: "Change camera", key: "C" },
  { action: "Headlights", key: "H" },
  { action: "Pit limiter", key: "L" },
  { action: "Telemetry / HUD", key: "F1" },
  { action: "Reset to track", key: "R" },
];

const KB_STRATEGY: ControlBinding[] = [
  { action: "Select unit / group", key: "Left Mouse" },
  { action: "Move order", key: "Right Mouse" },
  { action: "Assign control group", key: "Ctrl + 1-9" },
  { action: "Recall control group", key: "1-9" },
  { action: "Attack move", key: "A" },
  { action: "Stop", key: "S" },
  { action: "Hold position", key: "H" },
  { action: "Patrol", key: "P" },
  { action: "Cycle idle unit", key: "Tab" },
  { action: "Production queue", key: "Q" },
  { action: "Tech tree", key: "T" },
  { action: "Pause / slow time", key: "Space" },
  { action: "Jump to alert", key: "Backspace" },
];

const KB_SIMULATION: ControlBinding[] = [
  { action: "Pan camera", key: "W A S D" },
  { action: "Rotate / tilt", key: "Middle Mouse drag" },
  { action: "Zoom", key: "Mouse wheel" },
  { action: "Select tool", key: "1-9" },
  { action: "Rotate placement", key: "R" },
  { action: "Demolish", key: "X" },
  { action: "Copy / paste", key: "Ctrl + C / V" },
  { action: "Toggle grid", key: "G" },
  { action: "Toggle overlay", key: "O" },
  { action: "Speed controls", key: "1 / 2 / 3" },
  { action: "Blueprint library", key: "B" },
  { action: "Statistics panel", key: "F1" },
];

const KB_SPORTS: ControlBinding[] = [
  { action: "Move player", key: "W A S D" },
  { action: "Sprint", key: "Shift" },
  { action: "Pass", key: "A" },
  { action: "Shoot / Strike", key: "Space" },
  { action: "Finesse modifier", key: "Left Ctrl" },
  { action: "Switch player", key: "Q" },
  { action: "Skill move", key: "Right Mouse" },
  { action: "Tactics menu", key: "T" },
  { action: "Sprint trigger", key: "E" },
  { action: "Instant replay", key: "R" },
  { action: "Camera toggle", key: "C" },
  { action: "Substitutions", key: "S" },
];

const PAD_SHOOTER: ControlBinding[] = [
  { action: "Move", key: "Left stick" },
  { action: "Look / Aim", key: "Right stick" },
  { action: "Fire", key: "R2" },
  { action: "Aim down sights", key: "L2" },
  { action: "Jump / Vault", key: "X / A" },
  { action: "Crouch / Slide", key: "Circle / B" },
  { action: "Reload / Interact", key: "Square / X" },
  { action: "Melee", key: "R3" },
  { action: "Grenade", key: "L1" },
  { action: "Tactical ability", key: "R1" },
  { action: "Ultimate", key: "L1 + R1" },
  { action: "Ping", key: "Up on D-pad" },
  { action: "Map", key: "Touchpad / View" },
];

const PAD_MELEE: ControlBinding[] = [
  { action: "Move", key: "Left stick" },
  { action: "Camera", key: "Right stick" },
  { action: "Light attack", key: "Square / X" },
  { action: "Heavy attack", key: "Triangle / Y" },
  { action: "Dodge", key: "Circle / B" },
  { action: "Jump", key: "Cross / A" },
  { action: "Block / Parry", key: "L1" },
  { action: "Ability", key: "R1" },
  { action: "Lock target", key: "R3" },
  { action: "Interact", key: "Cross / A (hold)" },
  { action: "Inventory", key: "Touchpad / View" },
  { action: "Quick item", key: "D-pad" },
];

const PAD_RACING: ControlBinding[] = [
  { action: "Steer", key: "Left stick" },
  { action: "Throttle", key: "R2" },
  { action: "Brake", key: "L2" },
  { action: "Handbrake", key: "Circle / B" },
  { action: "Shift up / down", key: "R1 / L1" },
  { action: "Look back", key: "R3" },
  { action: "Camera", key: "Triangle / Y" },
  { action: "Reset to track", key: "Square / X" },
  { action: "HUD toggle", key: "Touchpad / View" },
  { action: "Pause / menu", key: "Options / Menu" },
];

const PAD_STRATEGY: ControlBinding[] = [
  { action: "Cursor", key: "Left stick" },
  { action: "Select", key: "Cross / A" },
  { action: "Cancel / deselect", key: "Circle / B" },
  { action: "Cycle unit", key: "L1 / R1" },
  { action: "Command wheel", key: "Triangle / Y" },
  { action: "Speed control", key: "L2 / R2" },
  { action: "Zoom", key: "Triggers" },
  { action: "Jump to alert", key: "R3" },
  { action: "Menu", key: "Options / Menu" },
];

const PAD_GENERAL: ControlBinding[] = [
  { action: "Move", key: "Left stick" },
  { action: "Camera", key: "Right stick" },
  { action: "Primary action", key: "Cross / A" },
  { action: "Secondary action", key: "Circle / B" },
  { action: "Context action", key: "Triangle / Y" },
  { action: "Modifier", key: "L1 / R1" },
  { action: "Aim / Brake", key: "L2" },
  { action: "Fire / Accelerate", key: "R2" },
  { action: "Menu", key: "Options / Menu" },
  { action: "Quick menu", key: "Touchpad / View" },
];

const TOUCH_ACTION: ControlBinding[] = [
  { action: "Move", key: "On-screen stick (left)" },
  { action: "Camera / Aim", key: "Drag anywhere (right)" },
  { action: "Primary action", key: "Main action button" },
  { action: "Secondary action", key: "Secondary cluster" },
  { action: "Sprint / Dodge", key: "Double-tap stick" },
  { action: "Inventory", key: "Top-left icon" },
  { action: "Map", key: "Mini-map tap" },
  { action: "Menu", key: "Top-right" },
  { action: "Toggle auto-fire", key: "Long press primary" },
];

const TOUCH_STRATEGY: ControlBinding[] = [
  { action: "Pan", key: "One-finger drag" },
  { action: "Zoom", key: "Pinch" },
  { action: "Select", key: "Tap" },
  { action: "Multi-select", key: "Long press, then drag" },
  { action: "Issue order", key: "Tap target" },
  { action: "Rotate view", key: "Two-finger twist" },
  { action: "Speed control", key: "Bottom-left widget" },
  { action: "Menu", key: "Top-right" },
];

/** Resolve the control bindings for a device + family combination. */
export function controlsFor(device: InputDevice, family: PlayFamily): ControlBinding[] {
  if (device === "touch") {
    return family === "strategy" || family === "simulation" ? TOUCH_STRATEGY : TOUCH_ACTION;
  }
  if (device === "gamepad") {
    if (family === "shooter") return PAD_SHOOTER;
    if (family === "racing") return PAD_RACING;
    if (family === "strategy" || family === "simulation") return PAD_STRATEGY;
    if (family === "sports" || family === "party") return PAD_GENERAL;
    return PAD_MELEE;
  }
  switch (family) {
    case "shooter":
      return KB_SHOOTER;
    case "racing":
      return KB_RACING;
    case "strategy":
      return KB_STRATEGY;
    case "simulation":
      return KB_SIMULATION;
    case "sports":
      return KB_SPORTS;
    default:
      return KB_MELEE;
  }
}

/** Which input device a platform uses by default. */
export function deviceForPlatform(platform: PlatformSlug): InputDevice {
  if (platform === "android" || platform === "ios") return "touch";
  if (
    platform === "ps5" ||
    platform === "ps4" ||
    platform === "xbox-series" ||
    platform === "xbox-one" ||
    platform === "switch"
  ) {
    return "gamepad";
  }
  return "keyboard";
}

