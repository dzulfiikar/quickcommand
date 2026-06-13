import { ClipboardPaste, CornerDownLeft } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSnippetPreviewText } from "@/lib/snippet-preview";

/** Convert snake_case/camelCase param names to readable labels. */
function humanize(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

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
      className="flex flex-col gap-5"
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <p className="section-label">Fill in</p>
          <h3 className="snippet-text-wrap text-lg font-semibold leading-snug text-foreground">
            {getSnippetPreviewText(props.snippetTitle)}
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={props.onCancel}
        >
          Cancel
        </Button>
      </div>
      <div className="flex flex-col gap-4">
        {props.params.map((name, i) => (
          <div key={name} className="space-y-1.5">
            <Label
              htmlFor={`param-${name}`}
              className="text-sm font-medium text-foreground"
            >
              {humanize(name)}
            </Label>
            <Input
              id={`param-${name}`}
              ref={i === 0 ? firstRef : undefined}
              type="text"
              placeholder={humanize(name).toLowerCase()}
              value={values[name]}
              onChange={(e) => handleChange(name, e.target.value)}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-3 pt-1">
        <span className="field-note inline-flex items-center gap-2">
          <span className="kbd">
            <CornerDownLeft className="h-3 w-3" aria-hidden="true" />
          </span>
          Paste
        </span>
        <Button type="submit" disabled={!allFilled} className="gap-2">
          <ClipboardPaste className="h-4 w-4" />
          Paste snippet
        </Button>
      </div>
    </form>
  );
});
