import React from "react";
import { createEditor, Node } from "slate";
import {
  Editable,
  withReact,
  Slate,
  RenderElementProps,
  RenderLeafProps
} from "slate-react";
import { DefaultElement } from "./elements";
import { Toolbar } from "./Toolbar";

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
  const editor = React.useMemo(() => withReact(createEditor()), []);

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
