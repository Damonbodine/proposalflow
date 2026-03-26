"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Bold, Italic, List, Eye, Edit3 } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name?: string;
  id?: string;
}

/**
 * A basic rich text editor using contentEditable.
 * Note: Content here is user-generated and only displayed back to the same user
 * within their own authenticated session -- it is not rendered to other users
 * from the server, so XSS risk is limited to self-XSS.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing...",
  name,
  id,
}: RichTextEditorProps) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const editorRef = useRef<HTMLDivElement>(null);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerText);
    }
  }, [onChange]);

  const execCommand = useCallback((command: string) => {
    document.execCommand(command, false);
    editorRef.current?.focus();
  }, []);

  return (
    <div className="rounded-lg border border-input bg-background shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1">
      {/* Hidden input for form submission */}
      {name && <input type="hidden" name={name} value={value} />}

      {/* Toolbar */}
      <div className="flex items-center gap-1 border-b px-3 py-1.5 bg-muted/30">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => execCommand("bold")}
          title="Bold"
        >
          <Bold className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => execCommand("italic")}
          title="Italic"
        >
          <Italic className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => execCommand("insertUnorderedList")}
          title="Bullet List"
        >
          <List className="h-3.5 w-3.5" />
        </Button>

        <div className="flex-1" />

        <Button
          type="button"
          variant={mode === "edit" ? "secondary" : "ghost"}
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={() => setMode("edit")}
        >
          <Edit3 className="h-3 w-3" />
          Write
        </Button>
        <Button
          type="button"
          variant={mode === "preview" ? "secondary" : "ghost"}
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={() => setMode("preview")}
        >
          <Eye className="h-3 w-3" />
          Preview
        </Button>
      </div>

      {/* Editor / Preview */}
      {mode === "edit" ? (
        <div
          ref={editorRef}
          id={id}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          className="min-h-[200px] px-4 py-3 text-sm leading-relaxed outline-none focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50"
          data-placeholder={placeholder}
        >
          {value || ""}
        </div>
      ) : (
        <div className="min-h-[200px] px-4 py-3 text-sm leading-relaxed">
          {value ? (
            <div className="prose prose-sm max-w-none text-foreground [&_ul]:list-disc [&_ul]:pl-5">
              {value.split("\n").map((line, i) => (
                <p key={i} className="mb-1">{line || "\u00A0"}</p>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground/50 italic">Nothing to preview</p>
          )}
        </div>
      )}
    </div>
  );
}
