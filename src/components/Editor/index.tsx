import * as React from "react";
import * as monaco from "monaco-editor";
import { observer, Observer } from "mobx-react";
// import parseAndGetASTRoot from "../../language-service/parser";
import EditorStore from "../../store/editorStore";
import { getConflictBlocksDecorationsCollection } from "./language-utils";

interface IEditorProps {
  language: string;
}

const Editor = (props: IEditorProps) => {
  const editorRef = React.useRef(null);
  const divNodeRef = React.useRef(null);


  let content = EditorStore.content;

React.useEffect(()=>{
  const editor = monaco.editor.create(divNodeRef.current, {
    language: props.language,
    minimap: { enabled: true },
    autoIndent: "full",
    theme: "vs-dark",
    mouseWheelZoom: true,
    fontSize: 20,
    value: content,
  });

  editorRef.current = editor;

  divNodeRef.current.style.height = '100%';
  divNodeRef.current.style.width = '100%';

  const model = editor.getModel();
  editor.createDecorationsCollection(
    getConflictBlocksDecorationsCollection(model.getValue()),
  );
  editor.onDidChangeModelContent(() => {
    editor.createDecorationsCollection([]);
    editor.createDecorationsCollection(
      getConflictBlocksDecorationsCollection(model.getValue()),
    );
  });
  model.onDidChangeContent((e) => {
    const changedContent = model.getValue()
    EditorStore.updateContentAction(
      changedContent
    );
  });
  return () => {
    editor.dispose();
  };
}, [])
  return <Observer>{() => (<div ref={divNodeRef} className="editor-container"></div>)}</Observer>;
};

export default observer(Editor);
