import { Search } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const SearchBar = memo(function SearchBar(props: {
  onQueryChange(query: string): void;
  placeholder: string;
  label?: string;
  autoFocus?: boolean;
  className?: string;
}) {
  const [value, setValue] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      props.onQueryChange(value);
    }, 120);
    return () => clearTimeout(timer);
  }, [value, props.onQueryChange]);

  return (
    <div className={cn("relative flex-1", props.className)}>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        aria-label={props.label ?? props.placeholder}
        autoFocus={props.autoFocus}
        className="pl-9 placeholder:text-muted-foreground/85"
        placeholder={props.placeholder}
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </div>
  );
});
