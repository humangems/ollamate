import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';

import {
  HighlightStyle,
  bracketMatching,
  indentOnInput,
  syntaxHighlighting
} from '@codemirror/language';
import { searchKeymap } from '@codemirror/search';
import { tags, styleTags, Tag } from '@lezer/highlight';
import CodeMirror, { EditorState, EditorView, KeyBinding, drawSelection, dropCursor, highlightSpecialChars, keymap, placeholder } from '@uiw/react-codemirror';
import { useCallback, useState } from 'react';
import { startEditing, stopEditing, toggleSidebar } from '../../redux/slice/uiSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { useNavigate } from 'react-router-dom';


const codeBlockTag = Tag.define();
const codeMarkTag = Tag.define();
const fencedCodeTag = Tag.define();
const inlineCodeTag = Tag.define();

const myHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, class: 'cmt-keyword' },
  { tag: tags.heading, class: 'cmt-heading' },
  { tag: tags.heading1, class: 'cmt-heading1' },
  { tag: tags.meta, class: 'cmt-meta' },
  { tag: tags.emphasis, class: 'cmt-emphasis' },
  { tag: tags.strong, class: 'cmt-strong' },
  { tag: tags.list, class: 'cmt-list' },
  // { tag: tags.monospace, class: 'cmt-mono' },
  { tag: tags.quote, class: 'cmt-quote' },
  { tag: codeBlockTag, class: 'cmt-codeblock' },
  { tag: codeMarkTag, class: 'cmt-codemark' },
  { tag: fencedCodeTag, class: 'cmt-fencedcode' },
  { tag: inlineCodeTag, class: 'cmt-inlinecode' },
]);

const basicSetup = /*@__PURE__*/ (() => [
  // highlightActiveLineGutter(),
  highlightSpecialChars(),
  history(),
  drawSelection(),
  dropCursor(),
  EditorState.allowMultipleSelections.of(true),
  indentOnInput(),
  EditorView.lineWrapping,
  bracketMatching(),
  closeBrackets(),
  autocompletion(),
  markdown({
    base: markdownLanguage,
    codeLanguages: languages,
    extensions: {
      props: [
        styleTags({ CodeBlock: codeBlockTag, CodeMark: codeMarkTag, FencedCode: fencedCodeTag, InlineCode: inlineCodeTag }),
      ],
    },
  }),
  syntaxHighlighting(myHighlightStyle),
  placeholder("What's in your mind?"),
  keymap.of([
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap,
    ...completionKeymap,
  ]),
])();


type Props = {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
};

export default function ContentEditor({ value, readOnly=false, onChange=()=>{} }: Props) {
  const [internaalValue, setInternalValue] = useState(value);
  const dispatch = useAppDispatch();
  const isWriting = useAppSelector(state => state.ui.writing);
  const navigate = useNavigate();
  const systemKeymap: KeyBinding[] = [
    {
      key: 'Mod-n',
      run: (_view) => {
        navigate("/")
        return true;
      },
    },
    {
      key: 'Mod-e',
      run: (_view) => {
        dispatch(toggleSidebar());
        return true;
      },
    },
  ];

  const onCodeChange = useCallback((val: any) => {
    setInternalValue(val);
    onChange(val);
    if (!isWriting) {
      dispatch(startEditing());
    }
  }, []);

  const handleMouseMove = () => {
    if (isWriting) {
      dispatch(stopEditing());
    }
  }

  return (
    <div className="mt-6 -mx-[6px]" onMouseMove={handleMouseMove}>
      <CodeMirror
        readOnly={readOnly}
        value={internaalValue}
        onChange={onCodeChange}
        basicSetup={false}
        autoFocus={internaalValue.length === 0}
        extensions={[basicSetup, keymap.of(systemKeymap)]}
      />
    </div>
  );
}
