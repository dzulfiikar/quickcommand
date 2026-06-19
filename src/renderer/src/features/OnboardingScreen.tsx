import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { fadeIn, slideUp } from "@/lib/motion";
import { SettingsPanel } from "../components/SettingsPanel";
import type { ScreenProps } from "./screen-props";

const STEPS = [
  {
    id: "review",
    label: "Overview",
    note: "What QuickCommand needs before it can paste for you.",
  },
  {
    id: "accessibility",
    label: "Accessibility",
    note: "Allow paste automation in the apps you actually use.",
  },
  {
    id: "shortcut",
    label: "Shortcut",
    note: "Pick the one keystroke that opens the palette.",
  },
] as const;

type Step = (typeof STEPS)[number]["id"];

export function OnboardingScreen(props: ScreenProps) {
  const [step, setStep] = useState<Step>("review");
  const stepIndex = STEPS.findIndex((item) => item.id === step);

  function next() {
    if (stepIndex < STEPS.length - 1) {
      setStep(STEPS[stepIndex + 1].id);
    }
  }

  function prev() {
    if (stepIndex > 0) {
      setStep(STEPS[stepIndex - 1].id);
    }
  }

  return (
    <motion.section
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="surface flex h-full min-h-0 flex-col overflow-hidden"
    >
      <header className="flex items-start justify-between gap-4 border-b border-border px-7 py-5">
        <div className="pane-header">
          <p className="section-label">Setup</p>
          <h2 className="pane-title-sm">Welcome to QuickCommand</h2>
        </div>
        <span
          className={
            props.permissionGranted
              ? "status-pill status-pill--success shrink-0"
              : "status-pill status-pill--warning shrink-0"
          }
        >
          {props.permissionGranted ? "Accessibility ready" : "Access needed"}
        </span>
      </header>

      {/* Horizontal stepper rail — one compact unit, fits the 720px window
          without burying the step content below the fold. */}
      <nav aria-label="Setup steps" className="border-b border-border px-7 py-3">
        <ol className="flex items-center gap-2">
          {STEPS.map((item, index) => {
            const active = index === stepIndex;
            const completed = index < stepIndex;

            return (
              <li key={item.id} className="flex flex-1 items-center gap-2">
                <button
                  type="button"
                  className={`list-item group !flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2 text-left ${
                    active ? "list-item-active" : ""
                  }`}
                  aria-current={active ? "step" : undefined}
                  onClick={() => setStep(item.id)}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums transition-colors ${
                      completed
                        ? "bg-[var(--accent-tint)] text-accent-text"
                        : active
                          ? "bg-primary text-primary-foreground"
                          : "border border-border-strong text-muted-foreground"
                    }`}
                    aria-hidden="true"
                  >
                    {completed ? <Check className="h-3.5 w-3.5" /> : index + 1}
                  </span>
                  <span
                    className={`truncate text-base font-medium ${
                      active ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
                {index < STEPS.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className={`h-px w-4 shrink-0 ${
                      completed ? "bg-primary/60" : "bg-border"
                    }`}
                  />
                ) : null}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-[40rem] flex-1 flex-col justify-center overflow-y-auto px-7 py-7">
          <AnimatePresence mode="wait">
            {step === "review" ? (
              <motion.div
                key="review"
                variants={slideUp}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="flex flex-col gap-5"
              >
                <div className="pane-header">
                  <p className="section-label">Overview</p>
                  <h3 className="pane-title">
                    Two things to set up, then it disappears
                  </h3>
                  <p className="prose-sans max-w-[58ch] text-base leading-relaxed text-muted-foreground">
                    Accessibility access lets QuickCommand paste into the active
                    app. A global shortcut gives you one consistent way to call
                    the palette from anywhere on your Mac.
                  </p>
                </div>
                <ul className="prose-sans flex flex-col gap-3 text-base leading-relaxed text-foreground">
                  {[
                    "Search snippets from the palette without leaving your current app.",
                    "Paste saved text exactly as written, including placeholders you fill at the moment of paste.",
                    "Manage longer snippets and behavior settings later from the full library window.",
                  ].map((line) => (
                    <li key={line} className="flex items-start gap-3">
                      <Check
                        className="mt-0.5 h-4 w-4 shrink-0 text-accent-text"
                        aria-hidden="true"
                      />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ) : null}

            {step === "accessibility" ? (
              <motion.div
                key="accessibility"
                variants={slideUp}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="flex flex-col gap-5"
              >
                <div className="pane-header">
                  <p className="section-label">Accessibility</p>
                  <h3 className="pane-title">Allow paste automation</h3>
                  <p className="prose-sans max-w-[58ch] text-base leading-relaxed text-muted-foreground">
                    Without Accessibility access, QuickCommand can search your
                    snippets but not paste them into the app you are using.
                    macOS will ask you to confirm in System Settings.
                  </p>
                </div>
                <div className="surface-muted flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
                  <div className="space-y-0.5">
                    <p className="text-base font-medium text-foreground">
                      {props.permissionGranted
                        ? "Access granted"
                        : "Access still needed"}
                    </p>
                    <p className="prose-sans text-sm text-muted-foreground">
                      {props.permissionGranted
                        ? "QuickCommand can paste into other apps."
                        : "QuickCommand can search but cannot paste yet."}
                    </p>
                  </div>
                  <span
                    className={
                      props.permissionGranted
                        ? "status-pill status-pill--success"
                        : "status-pill status-pill--warning"
                    }
                  >
                    {props.permissionGranted ? "Ready" : "Required"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    className="gap-2"
                    variant={props.permissionGranted ? "outline" : "default"}
                    onClick={() => void props.onAccessibilityPrompt()}
                  >
                    {props.permissionGranted ? (
                      <>
                        <Check className="h-4 w-4" />
                        Re-check access
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="h-4 w-4" />
                        Grant access
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => void props.onAccessibilityOpen()}
                  >
                    Open System Settings
                  </Button>
                </div>
              </motion.div>
            ) : null}

            {step === "shortcut" ? (
              <motion.div
                key="shortcut"
                variants={slideUp}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="flex flex-col gap-5"
              >
                <div className="pane-header">
                  <p className="section-label">Shortcut</p>
                  <h3 className="pane-title">
                    Pick a shortcut you will remember
                  </h3>
                  <p className="prose-sans max-w-[58ch] text-base leading-relaxed text-muted-foreground">
                    Choose one that does not collide with your editor, browser,
                    or terminal bindings. You can change it any time later from
                    the library settings.
                  </p>
                </div>
                {props.settings ? (
                  <SettingsPanel
                    settings={props.settings}
                    onSaveSettings={props.onSaveSettings}
                  />
                ) : null}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-4 md:px-8">
          <div>
            {stepIndex > 0 ? (
              <Button variant="ghost" className="gap-2" onClick={prev}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            ) : null}
          </div>
          <div>
            {stepIndex < STEPS.length - 1 ? (
              <Button className="gap-2" onClick={next}>
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                className="gap-2"
                onClick={() => void props.onCompleteOnboarding()}
              >
                Open library
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
