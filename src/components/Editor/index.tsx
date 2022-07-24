import * as React from "react";
import * as monaco from "monaco-editor-core";
// import parseAndGetASTRoot from "../../language-service/parser";


interface IEditorProps {
  language: string;
}

const Editor: React.FC<IEditorProps> = (props: IEditorProps) => {
  let divNode;
  const assignRef = React.useCallback((node) => {
    // On mount get the ref of the div and assign it the divNode
    divNode = node;
  }, []);

  React.useEffect(() => {
     if (divNode) {
       monaco.editor.create(divNode, {
         language: props.language,
         minimap: { enabled: true },
         autoIndent: "full",
         theme: "vs-dark",
         mouseWheelZoom: true,
         fontSize: 25,
         value: ``,
       });
     }
     // const ast = parseAndGetASTRoot(`ADD TODO "Create an editor"\nCOMPLETE TODO "Create an editor"`);
     // console.log(ast);

   }, [assignRef]);

  return <div ref={assignRef} className="editor-container"></div>;
};

export { Editor };
