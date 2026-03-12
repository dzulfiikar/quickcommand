import { Plus, X } from "lucide-react";
import { memo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { extractParams } from "../../../shared/cursor-placeholder";
import type { SnippetInput } from "../../../shared/snippet-model";

type FieldErrors = { title?: string; value?: string };

function validate(draft: SnippetInput): FieldErrors {
  const errors: FieldErrors = {};
  if (!draft.title.trim()) errors.title = "Title is required";
  if (!draft.value.trim()) errors.value = "Command text is required";
  return errors;
}

export const SnippetForm = memo(function SnippetForm(props: {
  draft: SnippetInput;
  onChange(value: SnippetInput): void;
  onSubmit(event: React.FormEvent): Promise<void>;
  saving: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [paramName, setParamName] = useState("");
  const [showParamInput, setShowParamInput] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const detectedParams = extractParams(props.draft.value);

  function handleBlur(field: "title" | "value") {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const fieldErrors = validate(props.draft);
    setErrors(fieldErrors);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const fieldErrors = validate(props.draft);
    setErrors(fieldErrors);
    setTouched({ title: true, value: true });

    if (Object.keys(fieldErrors).length > 0) return;

    void props.onSubmit(event);
  }

  function insertParam() {
    const name = paramName.trim();
    if (!name) return;

    const el = textareaRef.current;
    const placeholder = `{${name}}`;

    if (el) {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const before = props.draft.value.slice(0, start);
      const after = props.draft.value.slice(end);
      props.onChange({ ...props.draft, value: before + placeholder + after });

      requestAnimationFrame(() => {
        const pos = start + placeholder.length;
        el.setSelectionRange(pos, pos);
        el.focus();
      });
    } else {
      props.onChange({
        ...props.draft,
        value: props.draft.value + placeholder,
      });
    }

    setParamName("");
    setShowParamInput(false);
  }

  const titleError = touched.title ? errors.title : undefined;
  const valueError = touched.value ? errors.value : undefined;

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="space-y-1.5">
        <Label
          className={`text-xs ${titleError ? "text-destructive" : "text-muted-foreground"}`}
        >
          Title
        </Label>
        <Input
          placeholder="e.g. Git commit amend"
          value={props.draft.title}
          className={`h-9 bg-background/50 ${
            titleError
              ? "border-destructive/50 focus-visible:ring-destructive/30"
              : "border-border/60"
          }`}
          onChange={(event) =>
            props.onChange({
              ...props.draft,
              title: event.target.value,
            })
          }
          onBlur={() => handleBlur("title")}
        />
        {titleError && (
          <p className="text-[11px] text-destructive mt-1">{titleError}</p>
        )}
      </div>
      <div className="space-y-1.5">
        <Label
          className={`text-xs ${valueError ? "text-destructive" : "text-muted-foreground"}`}
        >
          Command / text
        </Label>
        <Textarea
          ref={textareaRef}
          placeholder="e.g. git commit --amend --no-edit"
          rows={4}
          className={`bg-background/50 font-mono text-[13px] resize-y max-h-[200px] overflow-y-auto ${
            valueError
              ? "border-destructive/50 focus-visible:ring-destructive/30"
              : "border-border/60"
          }`}
          value={props.draft.value}
          onChange={(event) =>
            props.onChange({
              ...props.draft,
              value: event.target.value,
            })
          }
          onBlur={() => handleBlur("value")}
        />
        {valueError && (
          <p className="text-[11px] text-destructive mt-1">{valueError}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {showParamInput ? (
          <div className="flex items-center gap-1.5">
            <Input
              className="w-28 h-7 text-xs font-mono bg-background/50 border-border/60"
              type="text"
              placeholder="param name"
              value={paramName}
              autoFocus
              onChange={(e) => setParamName(e.target.value.replace(/\s/g, "_"))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  insertParam();
                }
                if (e.key === "Escape") {
                  setShowParamInput(false);
                  setParamName("");
                }
              }}
            />
            <Button
              size="sm"
              className="h-7 px-2 text-xs pressable"
              type="button"
              disabled={!paramName.trim()}
              onClick={insertParam}
            >
              Insert
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              type="button"
              onClick={() => {
                setShowParamInput(false);
                setParamName("");
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2.5 text-xs gap-1"
            type="button"
            onClick={() => setShowParamInput(true)}
          >
            <Plus className="h-3 w-3" />
            Add Param
          </Button>
        )}

        {detectedParams.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {detectedParams.map((p) => (
              <Badge
                key={p}
                variant="outline"
                className="font-mono text-[10.5px] px-1.5 py-0 text-primary border-primary/30 bg-primary/5"
              >
                {`{${p}}`}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Button className="w-full pressable" disabled={props.saving} type="submit">
        {props.saving ? "Saving…" : "Save snippet"}
      </Button>
    </form>
  );
});
