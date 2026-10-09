import { useEffect, useRef } from "react";
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";
import type { Language } from "../../shared/content/items";

/** A plain CodeMirror editor. The initial value is read once; changes flow out through onChange. */
export function Editor({ initial, language, onChange, label }: { initial: string; language: Language; onChange: (code: string) => void; label: string }) {
  const host = useRef<HTMLDivElement>(null);
  const change = useRef(onChange);
  change.current = onChange;

  useEffect(() => {
    const view = new EditorView({
      parent: host.current!,
      state: EditorState.create({
        doc: initial,
        extensions: [
          basicSetup,
          language === "python" ? python() : javascript(),
          EditorState.tabSize.of(4),
          EditorView.contentAttributes.of({ "aria-label": label, autocapitalize: "off", autocorrect: "off", spellcheck: "false" }),
          EditorView.updateListener.of((u) => { if (u.docChanged) change.current(u.state.doc.toString()); }),
        ],
      }),
    });
    return () => view.destroy();
  }, [initial, language, label]);

  return <div className="editor" ref={host} />;
}
