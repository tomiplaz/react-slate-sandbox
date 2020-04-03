import React from "react";
import { createEditor, Node } from "slate";
import {
  Editable,
  withReact,
  Slate,
  RenderElementProps,
  RenderLeafProps
} from "slate-react";
import isUrl from 'is-url';
import { DefaultElement } from "./elements";
import { Toolbar, wrapLink } from "./Toolbar";

function renderElement(props: RenderElementProps) {
  const { attributes, children } = props;
  return <DefaultElement {...attributes}>{children}</DefaultElement>;
}

function renderLeaf({ attributes, children, leaf }: RenderLeafProps) {
  if (leaf.type === 'link') {
    children = <a href={leaf.url}>{children}</a>
  }

  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (leaf.italic) {
    children = <em>{children}</em>
  }

  if (leaf.underlined) {
    children = <u>{children}</u>
  }

  return <span {...attributes}>{children}</span>;
}

export interface EditorProps {
  value: Node[];
  onChange: (value: Node[]) => void;
  placeholder?: string;
  autoFocus?: boolean;
  spellCheck?: boolean;
}

export function Editor(props: EditorProps) {
  const { value, onChange, ...other } = props;
  const editor = React.useMemo(() => withReact(withLinks(createEditor())), []);

  function withLinks(editor: any) {
    /* const { insertData, insertText, isInline } = editor
  
    editor.isInline = (element: any) => {
      return element.type === 'link' ? true : isInline(element)
    }
  
    editor.insertText = (text: any) => {
      if (text && isUrl(text)) {
        wrapLink(editor, text)
      } else {
        insertText(text)
      }
    }
  
    editor.insertData = (data: any) => {
      const text = data.getData('text/plain')
  
      if (text && isUrl(text)) {
        wrapLink(editor, text)
      } else {
        insertData(data)
      }
    } */
  
    return editor
  }

  return (
    <Slate editor={editor} value={value} onChange={onChange}>
      <Toolbar/>
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        {...other}
      />
    </Slate>
  );
}

export { Node };
