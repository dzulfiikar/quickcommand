import { memo, useEffect, useRef, useState } from "react";

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
      className="param-form stack"
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
    >
      <div className="param-form__header">
        <span className="form-heading">{props.snippetTitle}</span>
        <button
          className="secondary-button"
          type="button"
          onClick={props.onCancel}
        >
          Cancel
        </button>
      </div>
      <div className="param-form__fields">
        {props.params.map((name, i) => (
          <label key={name} className="param-form__field">
            <span className="param-form__label">{`{${name}}`}</span>
            <input
              ref={i === 0 ? firstRef : undefined}
              className="param-form__input"
              type="text"
              placeholder={name}
              value={values[name]}
              onChange={(e) => handleChange(name, e.target.value)}
            />
          </label>
        ))}
      </div>
      <div className="param-form__actions">
        <button className="paste-button" type="submit" disabled={!allFilled}>
          Paste ↵
        </button>
        <span className="hint">
          Fill in all parameters, then press <kbd className="kbd">↵</kbd> to
          paste
        </span>
      </div>
    </form>
  );
});
