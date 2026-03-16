import {
  Download,
  ExternalLink,
  Loader2,
  RefreshCw,
  Terminal,
} from "lucide-react";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { appRepository } from "../../../shared/app-meta";
import type { AppUpdateInfo } from "../../../shared/update-model";

export const AboutPanel = memo(function AboutPanel(props: {
  onClose?: () => void;
  onCheckForUpdates(): Promise<void>;
  onOpenUpdateDownload(): Promise<void>;
  updateChecking: boolean;
  updateError: string | null;
  updateInfo: AppUpdateInfo | null;
}) {
  const updateAvailable = props.updateInfo?.availability === "update-available";
  const primaryUpdateLabel = props.updateChecking
    ? "Checking…"
    : "Check for updates";
  const secondaryUpdateLabel = updateAvailable
    ? `Download v${props.updateInfo?.latestVersion}`
    : "Open latest release";

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
            v{__APP_VERSION__}
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
            href={appRepository.url}
            onClick={(e) => {
              e.preventDefault();
              window.open(appRepository.url, "_blank");
            }}
          >
            github.com/dzulfiikar/quickcommand
          </a>
        </div>
        <Separator className="bg-border/30" />
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">License</span>
          <span className="text-foreground font-medium">MIT</span>
        </div>
      </div>
      <div className="flex flex-col gap-3 p-3 rounded-lg bg-muted/30 border border-border/40">
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Updates</span>
            <span className="text-foreground font-medium">
              {props.updateChecking
                ? "Checking GitHub Releases…"
                : updateAvailable
                  ? `v${props.updateInfo?.latestVersion} available`
                  : props.updateInfo
                    ? `v${props.updateInfo.currentVersion} is current`
                    : "Manual check"}
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Unsigned macOS builds cannot auto-install updates. QuickCommand
            checks GitHub Releases and opens the latest download in your browser
            for manual replacement.
          </p>
        </div>

        {props.updateInfo ? (
          <>
            <Separator className="bg-border/30" />
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Latest release</span>
              <span className="text-foreground font-medium">
                v{props.updateInfo.latestVersion}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Published</span>
              <span className="text-foreground font-medium">
                {new Date(
                  props.updateInfo.releasePublishedAt,
                ).toLocaleDateString()}
              </span>
            </div>
            <div className="rounded-md border border-border/40 bg-background/40 p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Release notes
              </p>
              <p className="mt-1 whitespace-pre-wrap text-[11px] leading-relaxed text-foreground/80">
                {props.updateInfo.releaseNotes}
              </p>
            </div>
          </>
        ) : null}

        {props.updateError ? (
          <div className="rounded-md border border-destructive/20 bg-destructive/5 px-2.5 py-2 text-[11px] leading-relaxed text-red-300">
            {props.updateError}
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={props.updateChecking}
            onClick={() => void props.onCheckForUpdates()}
          >
            {props.updateChecking ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            )}
            {primaryUpdateLabel}
          </Button>
          {props.updateInfo ? (
            <Button size="sm" onClick={() => void props.onOpenUpdateDownload()}>
              {updateAvailable ? (
                <Download className="mr-1.5 h-3.5 w-3.5" />
              ) : (
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              )}
              {secondaryUpdateLabel}
            </Button>
          ) : null}
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
