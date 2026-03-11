import { memo, useEffect, useState } from "react";

export const SearchBar = memo(function SearchBar(props: {
  onQueryChange(query: string): void;
  placeholder: string;
}) {
  const [value, setValue] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      props.onQueryChange(value);
    }, 150);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="search-field">
      <svg
        className="search-field__icon"
        width="15"
        height="15"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="6.5"
          cy="6.5"
          r="4.5"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M10 10L14 14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <input
        autoFocus
        className="search"
        placeholder={props.placeholder}
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </div>
  );
});
