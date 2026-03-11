import { SettingsPanel } from "../components/SettingsPanel";
import type { ScreenProps } from "./screen-props";

export function OnboardingScreen(props: ScreenProps) {
  return (
    <section className="stack">
      <div className="panel grid-two">
        <div>
          <h2>Grant Accessibility access</h2>
          <p>
            QuickCommand pastes snippets into the currently focused app by
            simulating a standard macOS paste action.
          </p>
          <p className={props.permissionGranted ? "status good" : "status bad"}>
            {props.permissionGranted
              ? "Accessibility is already enabled."
              : "Accessibility access is still missing."}
          </p>
        </div>
        <div className="stack">
          <button
            className="action-button"
            type="button"
            onClick={() => void props.onAccessibilityPrompt()}
          >
            {props.permissionGranted ? "Permission granted ✓" : "Grant Access"}
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={() => void props.onAccessibilityOpen()}
          >
            Open System Settings
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={() => void props.onCompleteOnboarding()}
          >
            Continue to library
          </button>
        </div>
      </div>

      <div className="panel grid-two">
        <div>
          <h2>Recommended defaults</h2>
          <p>Use a global shortcut to open the quick palette from any app.</p>
        </div>
        {props.settings ? (
          <SettingsPanel
            settings={props.settings}
            onSaveSettings={props.onSaveSettings}
          />
        ) : null}
      </div>
    </section>
  );
}
