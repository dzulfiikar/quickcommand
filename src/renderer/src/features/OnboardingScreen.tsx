import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Command,
  Keyboard,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { fadeIn, slideUp } from "@/lib/motion";
import { SettingsPanel } from "../components/SettingsPanel";
import type { ScreenProps } from "./screen-props";

const STEPS = ["welcome", "accessibility", "hotkey"] as const;
type Step = (typeof STEPS)[number];

export function OnboardingScreen(props: ScreenProps) {
  const [step, setStep] = useState<Step>("welcome");
  const stepIndex = STEPS.indexOf(step);

  function next() {
    if (stepIndex < STEPS.length - 1) setStep(STEPS[stepIndex + 1]);
  }
  function prev() {
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1]);
  }

  return (
    <motion.section
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="glass overflow-hidden flex flex-col"
    >
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 pt-6 pb-2">
        {STEPS.map((s, i) => (
          <button
            key={s}
            type="button"
            className={`h-1.5 rounded-full transition-all duration-200 ${
              i === stepIndex
                ? "w-6 bg-primary"
                : i < stepIndex
                  ? "w-1.5 bg-primary/40"
                  : "w-1.5 bg-muted-foreground/20"
            }`}
            onClick={() => i <= stepIndex && setStep(STEPS[i])}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 px-8 py-6">
        <AnimatePresence mode="wait">
          {step === "welcome" && (
            <motion.div
              key="welcome"
              variants={slideUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="flex flex-col items-center text-center gap-5"
            >
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <div className="flex flex-col gap-2">
                <h1 className="text-xl font-bold text-foreground tracking-tight">
                  Welcome to QuickCommand
                </h1>
                <p className="text-[13px] text-muted-foreground/60 leading-relaxed max-w-xs mx-auto">
                  Your clipboard command palette. Save text snippets and paste
                  them instantly from anywhere on your Mac.
                </p>
              </div>
              <div className="flex flex-col gap-3 w-full max-w-xs mt-2">
                <div className="flex items-center gap-3 text-left p-3 rounded-lg bg-accent/10">
                  <Command className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-[12px] text-muted-foreground">
                    Open the palette with a hotkey from any app
                  </span>
                </div>
                <div className="flex items-center gap-3 text-left p-3 rounded-lg bg-accent/10">
                  <Keyboard className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-[12px] text-muted-foreground">
                    Type to search, press Enter to paste
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {step === "accessibility" && (
            <motion.div
              key="accessibility"
              variants={slideUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="flex flex-col items-center text-center gap-5"
            >
              <div
                className={`h-14 w-14 rounded-2xl flex items-center justify-center ${
                  props.permissionGranted
                    ? "bg-emerald-500/10"
                    : "bg-destructive/10"
                }`}
              >
                {props.permissionGranted ? (
                  <Check className="h-7 w-7 text-emerald-400" />
                ) : (
                  <ShieldAlert className="h-7 w-7 text-destructive" />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-bold text-foreground tracking-tight">
                  Accessibility Permission
                </h2>
                <p className="text-[13px] text-muted-foreground/60 leading-relaxed max-w-xs mx-auto">
                  QuickCommand needs Accessibility access to paste snippets into
                  other apps.
                </p>
              </div>
              <div className="flex flex-col gap-2.5 w-full max-w-xs mt-1">
                <Button
                  className="w-full gap-2 pressable"
                  variant={props.permissionGranted ? "secondary" : "default"}
                  onClick={() => void props.onAccessibilityPrompt()}
                >
                  {props.permissionGranted ? (
                    <>
                      <Check className="h-4 w-4" />
                      Permission Granted
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="h-4 w-4" />
                      Grant Access
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground/50 text-[12px]"
                  onClick={() => void props.onAccessibilityOpen()}
                >
                  Open System Settings manually →
                </Button>
              </div>
            </motion.div>
          )}

          {step === "hotkey" && (
            <motion.div
              key="hotkey"
              variants={slideUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="flex flex-col items-center text-center gap-5"
            >
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Keyboard className="h-7 w-7 text-primary" />
              </div>
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-bold text-foreground tracking-tight">
                  Configure Hotkey
                </h2>
                <p className="text-[13px] text-muted-foreground/60 leading-relaxed max-w-xs mx-auto">
                  Set a global shortcut to summon QuickCommand from anywhere.
                </p>
              </div>
              <div className="w-full max-w-xs mt-1">
                {props.settings ? (
                  <SettingsPanel
                    settings={props.settings}
                    onSaveSettings={props.onSaveSettings}
                  />
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation footer */}
      <div className="flex items-center justify-between px-8 py-5 border-t border-border/20">
        <div>
          {stepIndex > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground/50 pressable"
              onClick={prev}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Button>
          )}
        </div>
        <div>
          {stepIndex < STEPS.length - 1 ? (
            <Button
              size="sm"
              className="gap-1.5 pressable"
              onClick={next}
            >
              Next
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              size="sm"
              className="gap-1.5 pressable"
              onClick={() => void props.onCompleteOnboarding()}
            >
              Get Started
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </motion.section>
  );
}
