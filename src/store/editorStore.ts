import { observable } from 'mobx';

const EditorStore = observable({
//state
content: '',
//action
updateContentAction(content: string,) {
this.content = content;
},
});

export default EditorStore;