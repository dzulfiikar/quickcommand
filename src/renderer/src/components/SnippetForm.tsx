import { memo, useRef, useState } from "react";
import { extractParams } from "../../../shared/cursor-placeholder";
import type { SnippetInput } from "../../../shared/snippet-model";

export const SnippetForm = memo(function SnippetForm(props: {
  draft: SnippetInput;
  onChange(value: SnippetInput): void;
  onSubmit(event: React.FormEvent): Promise<void>;
  saving: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [paramName, setParamName] = useState("");
  const [showParamInput, setShowParamInput] = useState(false);

  const detectedParams = extractParams(props.draft.value);

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

  return (
    <form className="stack" onSubmit={(event) => void props.onSubmit(event)}>
      <label>
        <span>Title</span>
        <input
          placeholder="e.g. Git commit amend"
          value={props.draft.title}
          onChange={(event) =>
            props.onChange({
              ...props.draft,
              title: event.target.value,
            })
          }
        />
      </label>
      <label>
        <span>Command / text</span>
        <textarea
          ref={textareaRef}
          placeholder="e.g. git commit --amend --no-edit"
          rows={4}
          value={props.draft.value}
          onChange={(event) =>
            props.onChange({
              ...props.draft,
              value: event.target.value,
            })
          }
        />
      </label>

      <div className="param-toolbar">
        {showParamInput ? (
          <div className="param-toolbar__input-row">
            <input
              className="param-toolbar__name-input"
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
            <button
              className="action-button action-button--small"
              type="button"
              disabled={!paramName.trim()}
              onClick={insertParam}
            >
              Insert
            </button>
            <button
              className="ghost-button"
              type="button"
              onClick={() => {
                setShowParamInput(false);
                setParamName("");
              }}
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            className="secondary-button secondary-button--small"
            type="button"
            onClick={() => setShowParamInput(true)}
          >
            + Add Param
          </button>
        )}

        {detectedParams.length > 0 && (
          <div className="param-toolbar__tags">
            {detectedParams.map((p) => (
              <span key={p} className="param-tag">{`{${p}}`}</span>
            ))}
          </div>
        )}
      </div>

      <button className="action-button" disabled={props.saving} type="submit">
        {props.saving ? "Saving…" : "Save snippet"}
      </button>
    </form>
  );
});
