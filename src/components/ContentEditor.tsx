"use client";

import { useEffect, useRef, useCallback } from "react";
import { EditorView, keymap, placeholder as cmPlaceholder } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { markdown } from "@codemirror/lang-markdown";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import {
  syntaxHighlighting,
  defaultHighlightStyle,
  bracketMatching,
  indentOnInput,
} from "@codemirror/language";
import { oneDark } from "@codemirror/theme-one-dark";
import { useTheme } from "next-themes";

interface ContentEditorProps {
  value: string;
  onChange: (value: string) => void;
  format: string;
  className?: string;
}

export default function ContentEditor({ value, onChange, format, className }: ContentEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const { resolvedTheme } = useTheme();

  // Keep onChange ref current without triggering editor recreation
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const createEditor = useCallback(() => {
    if (!containerRef.current) return;

    // Clean up existing editor
    if (viewRef.current) {
      viewRef.current.destroy();
      viewRef.current = null;
    }

    const isDark = resolvedTheme === "dark";

    const extensions = [
      history(),
      bracketMatching(),
      indentOnInput(),
      highlightSelectionMatches(),
      syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
      keymap.of([...defaultKeymap, ...historyKeymap, ...searchKeymap]),
      EditorView.lineWrapping,
      cmPlaceholder("Start writing..."),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          onChangeRef.current(update.state.doc.toString());
        }
      }),
      EditorView.theme({
        "&": {
          fontSize: "14px",
          minHeight: "400px",
        },
        ".cm-content": {
          fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, monospace",
          padding: "16px",
        },
        ".cm-gutters": {
          display: "none",
        },
        ".cm-focused": {
          outline: "none",
        },
        "&.cm-focused": {
          outline: "none",
        },
      }),
    ];

    // Add language support for markdown (also reasonable for LaTeX)
    if (format === "md" || format === "tex") {
      extensions.push(markdown());
    }

    // Dark mode
    if (isDark) {
      extensions.push(oneDark);
    }

    const state = EditorState.create({
      doc: value,
      extensions,
    });

    viewRef.current = new EditorView({
      state,
      parent: containerRef.current,
    });
  }, [resolvedTheme, format]); // value intentionally excluded — only set on creation

  // Create editor on mount, recreate on theme/format change
  useEffect(() => {
    createEditor();
    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, [createEditor]);

  // Sync external value changes (e.g., reset) without recreating editor
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const currentDoc = view.state.doc.toString();
    if (currentDoc !== value) {
      view.dispatch({
        changes: { from: 0, to: currentDoc.length, insert: value },
      });
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      className={`rounded-xl border border-border bg-card overflow-hidden [&_.cm-editor]:bg-transparent ${className ?? ""}`}
    />
  );
}
