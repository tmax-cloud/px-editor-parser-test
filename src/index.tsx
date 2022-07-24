import * as React from "react";
import * as ReactDOM from "react-dom";
import { Editor } from "./components/Editor";
import "./style.css";
import { setupLanguage } from "./java/setup";
import { languageID } from './java/config';

// import { language } from "./java";

setupLanguage();
const App = () => (
  <>
    <div className="title">Java Editor</div>
    <Editor language={"java"}></Editor>
  </>
);

ReactDOM.render(<App />, document.getElementById("container"));
