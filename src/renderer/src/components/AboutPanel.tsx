import { Terminal } from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const AboutPanel = memo(function AboutPanel(props: {
  onClose?: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
          <Terminal className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-[15px] font-semibold text-foreground leading-tight">
            QuickCommand
          </h2>
          <span className="font-mono text-[11px] text-muted-foreground">
            v0.1.0
          </span>
        </div>
      </div>
      <p className="text-[13px] text-muted-foreground leading-relaxed">
        A fast macOS menubar snippet launcher. Paste commands, templates, and
        code snippets instantly with keyboard shortcuts.
      </p>
      <div className="flex flex-col gap-2 p-3 rounded-lg bg-muted/30 border border-border/40">
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">Created by</span>
          <span className="text-foreground font-medium">Dzulfikar</span>
        </div>
        <Separator className="bg-border/30" />
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">Source</span>
          <a
            className="text-primary hover:underline cursor-pointer font-medium"
            href="https://github.com/dzulfiikar/"
            onClick={(e) => {
              e.preventDefault();
              window.open("https://github.com/dzulfiikar/", "_blank");
            }}
          >
            github.com/dzulfiikar
          </a>
        </div>
        <Separator className="bg-border/30" />
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">License</span>
          <span className="text-foreground font-medium">MIT</span>
        </div>
      </div>
      {props.onClose ? (
        <Button
          variant="secondary"
          size="sm"
          className="self-end"
          onClick={props.onClose}
        >
          Close
        </Button>
      ) : null}
    </div>
  );
});
