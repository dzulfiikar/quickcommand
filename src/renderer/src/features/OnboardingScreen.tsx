import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { fadeIn, slideUp } from "@/lib/motion";
import { formatShortcut } from "@/lib/shortcut";
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

  const currentStep = useMemo(() => STEPS[stepIndex], [stepIndex]);

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
      className="surface flex h-full min-h-0 flex-col overflow-hidden xl:grid xl:grid-cols-[20rem_minmax(0,1fr)]"
    >
      <aside className="flex flex-col gap-6 border-b border-border p-5 xl:border-b-0 xl:border-r">
        <div className="space-y-2">
          <p className="section-label">Setup</p>
          <p className="max-w-[34ch] text-lg leading-relaxed text-muted-foreground">
            Three small things, then QuickCommand disappears. No account, no
            sync, no cloud.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="kbd">
            {formatShortcut(props.settings?.globalShortcut)}
          </span>
          <span
            className={
              props.permissionGranted
                ? "status-pill status-pill--success"
                : "status-pill status-pill--warning"
            }
          >
            {props.permissionGranted ? "Accessibility ready" : "Access needed"}
          </span>
        </div>

        <ol className="flex flex-col gap-1">
          {STEPS.map((item, index) => {
            const active = index === stepIndex;
            const completed = index < stepIndex;

            return (
              <li key={item.id}>
                <button
                  type="button"
                  className={`list-item flex w-full items-start gap-3 px-3 py-3 text-left ${
                    active ? "list-item-active" : ""
                  }`}
                  aria-current={active ? "step" : undefined}
                  onClick={() => setStep(item.id)}
                >
                  <span
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-sm font-medium text-muted-foreground"
                    aria-hidden="true"
                  >
                    {completed ? (
                      <Check className="h-3.5 w-3.5 text-foreground" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className="space-y-1">
                    <span className="block text-base font-semibold text-foreground">
                      {item.label}
                    </span>
                    <span className="block text-sm leading-relaxed text-muted-foreground">
                      {item.note}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </aside>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 px-5 py-6 md:px-8">
          <AnimatePresence mode="wait">
            {step === "review" ? (
              <motion.div
                key="review"
                variants={slideUp}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="flex flex-col gap-6"
              >
                <div className="space-y-2">
                  <p className="section-label">{currentStep.label}</p>
                  <h3 className="text-2xl font-semibold tracking-[-0.015em] text-foreground">
                    Two things to set up, then it disappears
                  </h3>
                  <p className="max-w-[58ch] text-lg leading-relaxed text-muted-foreground">
                    Accessibility access lets QuickCommand paste into the active
                    app. A global shortcut gives you one consistent way to call
                    the palette from anywhere on your Mac.
                  </p>
                </div>
                <ul className="flex flex-col gap-2.5 text-base leading-relaxed text-foreground">
                  <li>
                    Search snippets from the palette without leaving your
                    current app.
                  </li>
                  <li>
                    Paste saved text exactly as written, including placeholders
                    you fill at the moment of paste.
                  </li>
                  <li>
                    Manage longer snippets and behavior settings later from the
                    full library window.
                  </li>
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
                className="flex flex-col gap-6"
              >
                <div className="space-y-2">
                  <p className="section-label">{currentStep.label}</p>
                  <h3 className="text-2xl font-semibold tracking-[-0.015em] text-foreground">
                    Allow paste automation
                  </h3>
                  <p className="max-w-[58ch] text-lg leading-relaxed text-muted-foreground">
                    Without Accessibility access, QuickCommand can search your
                    snippets but not paste them into the app you are using.
                    macOS will ask you to confirm in System Settings.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-secondary/40 px-4 py-3">
                  <div className="space-y-0.5">
                    <p className="text-base font-medium text-foreground">
                      {props.permissionGranted
                        ? "Access granted"
                        : "Access still needed"}
                    </p>
                    <p className="text-sm text-muted-foreground">
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
                className="flex flex-col gap-6"
              >
                <div className="space-y-2">
                  <p className="section-label">{currentStep.label}</p>
                  <h3 className="text-2xl font-semibold tracking-[-0.015em] text-foreground">
                    Pick a shortcut you will remember
                  </h3>
                  <p className="max-w-[58ch] text-lg leading-relaxed text-muted-foreground">
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
