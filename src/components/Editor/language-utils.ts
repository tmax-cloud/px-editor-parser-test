import * as monaco from 'monaco-editor';

export const getConflictBlocks = (content: string) => {
  const conflictBlocks = [];
  const lines = content.split(/\r?\n/);
  // get three way start line
  let block = {
    left_start: -1,
    // base_start: -1,
    right_start: -1,
    right_end: -1,
    left_code: [],
    // base_code: [],
    right_code: [],
  };
  let insideBlock = -1; // 1=left 0=base 2=right
  for (let i in lines) {
    let line = lines[i];
    if (insideBlock < 0) {
      if (line.startsWith('<<<<<<<')) {
        block = {
          left_start: -1,
          //   base_start: -1,
          right_start: -1,
          right_end: -1,
          left_code: [],
          // base_code: [],
          right_code: [],
        };
        block.left_start = parseInt(i) + 1;
        insideBlock = 1;
        continue;
      }
    } else {
      // if (line.startsWith('|||||||')) {
      //   block.base_start = parseInt(i) + 1;
      //   insideBlock = 0;
      //   continue;
      // }
      if (line.startsWith('=======')) {
        block.right_start = parseInt(i) + 1;
        insideBlock = 2;
        continue;
      }
      if (line.startsWith('>>>>>>>')) {
        block.right_end = parseInt(i) + 1;
        conflictBlocks.push(block);
        block = {
          left_start: -1,
          //   base_start: -1,
          right_start: -1,
          right_end: -1,
          left_code: [],
          // base_code: [],
          right_code: [],
        };
        insideBlock = -1;
        continue;
      }
      switch (insideBlock) {
        case 1:
          block.left_code.push(line);
          break;
        // case 0:
        //   block.base_code.push(line);
        //   break;
        case 2:
          block.right_code.push(line);
          break;
      }
    }
  }
  return conflictBlocks;
};

export const getConflictBlockLenses = (content: string) => {
  const conflictBlocks = getConflictBlocks(content);
  const conflictBlockLenses = [];
  conflictBlocks.length > 0 &&
    conflictBlocks.forEach((block) => {
      conflictBlockLenses.push({
        range: {
          startLineNumber: block.left_start,
          endLineNumber: block.left_start,
          startColumn: 0,
          endColumn: 0,
        },
        command: {
          id: 'current',
          title: 'Select Current Text',
          arguments: [
            {
              start: block.left_start,
              end: block.right_end,
              code: block.left_code,
            },
          ],
        },
      });
      conflictBlockLenses.push({
        range: {
          startLineNumber: block.left_start,
          endLineNumber: block.left_start,
          startColumn: 0,
          endColumn: 0,
        },
        command: {
          id: 'incomming',
          title: 'Select Incomming Text',
          arguments: [
            {
              start: block.left_start,
              end: block.right_end,
              code: block.right_code,
            },
          ],
        },
      });
    });
  return conflictBlockLenses;
};

export const getConflictBlocksDecorationsCollection = (content: string) => {
  const conflictBlocksDecorationsCollection = [];
  const conflictBlocks = getConflictBlocks(content);
  conflictBlocks.forEach((block) => {
    conflictBlocksDecorationsCollection.push({
      range: new monaco.Range(
        block.left_start + 1,
        0,
        block.right_start - 1,
        0,
      ),
      options: {
        isWholeLine: true,
        className: 'leftLineDecoration',
        marginClassName: 'leftLineDecoration',
      },
    });
    conflictBlocksDecorationsCollection.push({
      range: new monaco.Range(block.right_start + 1, 0, block.right_end - 1, 0),
      options: {
        isWholeLine: true,
        className: 'rightLineDecoration',
        marginClassName: 'rightLineDecoration',
      },
    });
  });
  return conflictBlocksDecorationsCollection;
};

export const selectConflict = (
  editor: monaco.editor.ICodeEditor,
  selectInfo: any,
) => {
  editor.executeEdits('my-source', [
    {
      range: new monaco.Range(selectInfo.start, 0, selectInfo.end + 1, 0),
      text: selectInfo.code.join('\n'),
    },
  ]);
};
