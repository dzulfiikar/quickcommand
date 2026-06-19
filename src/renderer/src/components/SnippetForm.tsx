import { Plus, X } from "lucide-react";
import { memo, useId, useRef, useState } from "react";
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
  if (!draft.title.trim())
    errors.title = "Add a title so you can find it later";
  if (!draft.value.trim()) errors.value = "Add the text you want to paste";
  return errors;
}

export const SnippetForm = memo(function SnippetForm(props: {
  deleteDisabled?: boolean;
  deleteConfirming?: boolean;
  draft: SnippetInput;
  onChange(value: SnippetInput): void;
  onDelete?(): Promise<void>;
  onConfirmDelete?(): Promise<void>;
  onCancelDelete?(): void;
  onSubmit(event: React.FormEvent): Promise<void>;
  saving: boolean;
}) {
  const titleId = useId();
  const valueId = useId();
  const paramId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [paramName, setParamName] = useState("");
  const [showParamInput, setShowParamInput] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const detectedParams = extractParams(props.draft.value);
  const confirming = props.deleteConfirming ?? false;

  function handleBlur(field: "title" | "value") {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate(props.draft));
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
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor={titleId}
          className={`text-sm ${titleError ? "text-destructive" : "text-foreground"}`}
        >
          Title
        </Label>
        <Input
          id={titleId}
          placeholder="Git commit amend"
          value={props.draft.title}
          aria-invalid={titleError ? true : undefined}
          aria-describedby={titleError ? `${titleId}-error` : undefined}
          onChange={(event) =>
            props.onChange({
              ...props.draft,
              title: event.target.value,
            })
          }
          onBlur={() => handleBlur("title")}
        />
        {titleError ? (
          <p
            id={`${titleId}-error`}
            className="text-xs text-destructive-foreground"
          >
            {titleError}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label
            htmlFor={valueId}
            className={`text-sm ${valueError ? "text-destructive" : "text-foreground"}`}
          >
            Snippet text
          </Label>
          <p className="field-note">
            Wrap a placeholder like{" "}
            <code className="font-mono text-foreground/80">{"{name}"}</code> to
            fill it before paste.
          </p>
        </div>
        <Textarea
          id={valueId}
          ref={textareaRef}
          placeholder="git commit --amend --no-edit"
          rows={4}
          className="max-h-[260px] resize-y overflow-y-auto font-mono text-base leading-relaxed"
          aria-invalid={valueError ? true : undefined}
          aria-describedby={valueError ? `${valueId}-error` : undefined}
          value={props.draft.value}
          onChange={(event) =>
            props.onChange({
              ...props.draft,
              value: event.target.value,
            })
          }
          onBlur={() => handleBlur("value")}
        />
        {valueError ? (
          <p
            id={`${valueId}-error`}
            className="text-xs text-destructive-foreground"
          >
            {valueError}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {showParamInput ? (
          <div className="surface-inset flex items-center gap-1.5 px-2 py-1.5">
            <Label htmlFor={paramId} className="sr-only">
              Parameter name
            </Label>
            <Input
              id={paramId}
              aria-label="Parameter name"
              className="h-8 w-32 font-mono text-sm"
              type="text"
              placeholder="name"
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
              className="h-8 px-3"
              type="button"
              disabled={!paramName.trim()}
              onClick={insertParam}
            >
              Insert
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              className="size-8"
              aria-label="Cancel parameter"
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
            className="gap-1"
            type="button"
            onClick={() => setShowParamInput(true)}
          >
            <Plus className="h-3 w-3" />
            Add placeholder
          </Button>
        )}

        {detectedParams.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {detectedParams.map((p) => (
              <Badge
                key={p}
                variant="outline"
                className="px-1.5 py-0.5 text-2xs"
              >
                {`{${p}}`}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
        {props.onDelete ? (
          confirming ? (
            <div className="notice notice--error flex flex-1 items-center gap-2 rounded-md px-3 py-2 text-sm">
              <span className="flex-1">
                Delete this snippet? It cannot be undone.
              </span>
              <Button
                size="sm"
                variant="ghost"
                type="button"
                onClick={() => props.onCancelDelete?.()}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                variant="destructive"
                type="button"
                disabled={props.deleteDisabled}
                onClick={() => void props.onConfirmDelete?.()}
              >
                Delete snippet
              </Button>
            </div>
          ) : (
            <Button
              disabled={props.deleteDisabled}
              type="button"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => void props.onDelete?.()}
            >
              Delete snippet
            </Button>
          )
        ) : null}
        {confirming ? null : (
          <Button
            className={props.onDelete ? "" : "min-w-36"}
            disabled={props.saving}
            type="submit"
          >
            {props.saving ? "Saving…" : "Save snippet"}
          </Button>
        )}
      </div>
    </form>
  );
});
