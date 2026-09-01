"use client";

import { useTheme } from "next-themes";
import { MoonStarIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/base/primitives/button";

const ModeToggle = () => {
  const { setTheme, resolvedTheme } = useTheme();

  const handleModeChange = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <Button variant="ghost" size="icon" className="relative" onClick={handleModeChange}>
      <MoonStarIcon className="scale-100 dark:scale-0" />
      <SunIcon className="absolute scale-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ModeToggle;
