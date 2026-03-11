import { memo } from "react";
import type { SnippetInput } from "../../../shared/snippet-model";

export const SnippetForm = memo(function SnippetForm(props: {
  draft: SnippetInput;
  onChange(value: SnippetInput): void;
  onSubmit(event: React.FormEvent): Promise<void>;
  saving: boolean;
}) {
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
      <button className="action-button" disabled={props.saving} type="submit">
        {props.saving ? "Saving…" : "Save snippet"}
      </button>
    </form>
  );
});