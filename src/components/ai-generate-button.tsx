"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";

interface AiGenerateButtonProps {
  fieldName: string;
  context: any;
  onGenerated: (text: string) => void;
  disabled?: boolean;
}

export function AiGenerateButton({
  fieldName,
  context,
  onGenerated,
  disabled,
}: AiGenerateButtonProps) {
  const generate = useAction(api.ai.generate);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const result = await generate({ fieldName, context });
      onGenerated(result);
    } catch (error) {
      console.error("AI generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Generate with AI
        </>
      )}
    </Button>
  );
}
