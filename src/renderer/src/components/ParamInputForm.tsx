import { ClipboardPaste } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const ParamInputForm = memo(function ParamInputForm(props: {
  params: string[];
  snippetTitle: string;
  onSubmit(values: Record<string, string>): void;
  onCancel(): void;
}) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const p of props.params) {
      initial[p] = "";
    }
    return initial;
  });

  const firstRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  function handleChange(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    props.onSubmit(values);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      props.onCancel();
    }
  }

  const allFilled = props.params.every((p) => values[p].trim().length > 0);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          {props.snippetTitle}
        </h3>
        <Button
          variant="secondary"
          size="sm"
          className="h-7 text-xs"
          type="button"
          onClick={props.onCancel}
        >
          Cancel
        </Button>
      </div>
      <div className="flex flex-col gap-3">
        {props.params.map((name, i) => (
          <div key={name} className="space-y-1.5">
            <Label className="font-mono text-xs text-primary">
              {`{${name}}`}
            </Label>
            <Input
              ref={i === 0 ? firstRef : undefined}
              className="h-9 font-mono text-[13px] bg-background/50 border-border/60"
              type="text"
              placeholder={name}
              value={values[name]}
              onChange={(e) => handleChange(name, e.target.value)}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 pt-1">
        <Button
          size="sm"
          className="gap-1.5"
          type="submit"
          disabled={!allFilled}
        >
          <ClipboardPaste className="h-3.5 w-3.5" />
          Paste
        </Button>
        <span className="text-[11px] text-muted-foreground/60">
          Fill in all parameters, then press{" "}
          <kbd className="inline-block px-1.5 py-0.5 rounded bg-muted border border-border/60 font-mono text-[10px] text-muted-foreground">
            ↵
          </kbd>{" "}
          to paste
        </span>
      </div>
    </form>
  );
});
