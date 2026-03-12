import { Search } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const SearchBar = memo(function SearchBar(props: {
  onQueryChange(query: string): void;
  placeholder: string;
  className?: string;
}) {
  const [value, setValue] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      props.onQueryChange(value);
    }, 150);
    return () => clearTimeout(timer);
  }, [value, props.onQueryChange]);

  return (
    <div className={cn("relative flex-1", props.className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none transition-colors" />
      <Input
        autoFocus
        className="pl-9 h-10 bg-background/50 border-border/60 text-[15px] placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-ring/40"
        placeholder={props.placeholder}
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </div>
  );
});
