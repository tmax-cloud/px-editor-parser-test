import * as React from "react";
import * as ReactDOM from "react-dom/client";
import Editor from "./components/Editor";
import LezerParser from "./components/Editor/parser"
import "./style.css";
import { setupLanguage } from "./java/setup";
import { languageID } from './java/config';

// import { language } from "./java";
const root = ReactDOM.createRoot(document.getElementById('container'));

setupLanguage();
const App = () => (
  <>
    <div className="title">Java Editor</div>
    <div className="playground"> <div className="editor"><Editor language={"java"}></Editor></div>
      <div className="parser"><LezerParser ></LezerParser></div></div>
  </>
);

root.render(<App />);
