import { EmojiNode } from '@/nodes/EmojiNode';
import EmojiPlugin from '@/plugins/EmojiPlugin';
import MyOnChangePlugin from '@/plugins/MyOnChangePlugin';
import ToolbarPlugin from '@/plugins/ToolbarPlugin';
import TreeViewPlugin from '@/plugins/TreeViewPlugin';
import theme from '@/theme';
import { constructImportMap, removeStylesExportDOM } from '@/utils';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import {
  InitialConfigType,
  LexicalComposer,
} from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import {
  DOMExportOutput,
  DOMExportOutputMap,
  EditorState,
  Klass,
  LexicalEditor,
  LexicalNode,
  ParagraphNode,
  TextNode,
} from 'lexical';
import { useState } from 'react';

const placeholder = 'Enter some rich text...';

const exportMap: DOMExportOutputMap = new Map<
  Klass<LexicalNode>,
  (editor: LexicalEditor, target: LexicalNode) => DOMExportOutput
>([
  [ParagraphNode, removeStylesExportDOM],
  [TextNode, removeStylesExportDOM],
]);

const initialConfig: InitialConfigType = {
  html: {
    export: exportMap,
    import: constructImportMap(),
  },
  namespace: 'React.js Demo',
  nodes: [ParagraphNode, TextNode, EmojiNode],
  onError(error: Error) {
    throw error;
  },
  theme,
};

const Editor = () => {
  const [editorState, setEditorState] = useState<string>();

  function onChange(onChangeState: EditorState) {
    setEditorState(JSON.stringify(onChangeState.toJSON()));
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="editor-container">
        <ToolbarPlugin />
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="editor-input"
                aria-placeholder={placeholder}
                placeholder={
                  <div className="editor-placeholder">{placeholder}</div>
                }
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin delay={10} />
          <EmojiPlugin />
          <AutoFocusPlugin />
          <TreeViewPlugin />
          <MyOnChangePlugin onChange={onChange} />
        </div>
      </div>
    </LexicalComposer>
  );
};

export default Editor;
