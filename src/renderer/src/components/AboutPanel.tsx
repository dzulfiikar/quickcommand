import { memo } from "react";

export const AboutPanel = memo(function AboutPanel(props: {
  onClose?: () => void;
}) {
  return (
    <div className="about-panel">
      <div className="about-panel__header">
        <span className="about-panel__icon">&gt;_</span>
        <div>
          <h2 className="about-panel__title">QuickCommand</h2>
          <span className="about-panel__version">v0.1.0</span>
        </div>
      </div>
      <p className="about-panel__desc">
        A fast macOS menubar snippet launcher. Paste commands, templates, and
        code snippets instantly with keyboard shortcuts.
      </p>
      <div className="about-panel__meta">
        <div className="about-panel__row">
          <span className="about-panel__label">Created by</span>
          <span className="about-panel__value">Dzulfikar</span>
        </div>
        <div className="about-panel__row">
          <span className="about-panel__label">Source</span>
          <a
            className="about-panel__link"
            href="https://github.com/dzulfiikar/"
            onClick={(e) => {
              e.preventDefault();
              window.open("https://github.com/dzulfiikar/", "_blank");
            }}
          >
            github.com/dzulfiikar
          </a>
        </div>
        <div className="about-panel__row">
          <span className="about-panel__label">License</span>
          <span className="about-panel__value">MIT</span>
        </div>
      </div>
      {props.onClose ? (
        <button
          className="secondary-button about-panel__close"
          type="button"
          onClick={props.onClose}
        >
          Close
        </button>
      ) : null}
    </div>
  );
});
