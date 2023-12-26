import * as React from "react";
import * as lezer from "@lezer/common"
import { parser } from "@lezer/java"
import { observer, Observer } from "mobx-react";
// import parseAndGetASTRoot from "../../language-service/parser";
import EditorStore from "../../store/editorStore";

const LezerParser = () => {

    let content = EditorStore.content;
    let tree = new lezer.Parser.parse(content);
    let parseResult = tree.toString();
    return <Observer>{() => (<div className="editor-container">{parseResult}</div>)}</Observer>;
};

export default observer(LezerParser);
