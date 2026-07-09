import React, { useEffect, useRef } from "react";
import { normalizeEditorValue, sanitizeRichText, toPlainText } from "../utils/richText";

const toolbarButtons = [
  { label: "B", command: "bold", title: "Bold" },
  { label: "I", command: "italic", title: "Italic" },
  { label: "List", command: "insertUnorderedList", title: "Bullet list" },
  { label: "Quote", command: "formatBlock", value: "blockquote", title: "Quote" }
];

function ArticleEditor({ value, onChange, placeholder }) {
  const editorRef = useRef(null);

  useEffect(() => {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    const normalizedValue = normalizeEditorValue(value);

    if (editor.innerHTML !== normalizedValue) {
      editor.innerHTML = normalizedValue;
    }
  }, [value]);

  const emitChange = () => {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    const nextValue = sanitizeRichText(editor.innerHTML);
    onChange(nextValue);
  };

  const handleCommand = (command, commandValue) => {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    editor.focus();
    document.execCommand(command, false, commandValue);
    emitChange();
  };

  const handleInput = () => {
    emitChange();
  };

  const handleBlur = () => {
    emitChange();
  };

  const isEmpty = toPlainText(value).length === 0;

  return (
    <div className="article-editor-shell">
      <div className="editor-toolbar" aria-label="Article formatting tools">
        {toolbarButtons.map((button) => (
          <button
            key={button.command}
            type="button"
            className="editor-tool-button"
            title={button.title}
            onClick={() => handleCommand(button.command, button.value)}
          >
            {button.label}
          </button>
        ))}
      </div>

      <div className="editor-frame">
        {isEmpty ? <div className="editor-placeholder">{placeholder}</div> : null}
        <div
          ref={editorRef}
          className="article-editor"
          contentEditable
          role="textbox"
          aria-multiline="true"
          aria-label="Article content editor"
          onInput={handleInput}
          onBlur={handleBlur}
          suppressContentEditableWarning
        />
      </div>
    </div>
  );
}

export default ArticleEditor;
