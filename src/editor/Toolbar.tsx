import React, {
  useState,
  useEffect,
  useRef,
  FormEvent,
  ChangeEvent,
  MouseEvent
} from "react";
import {
  ButtonGroup,
  IconButton,
  Input
} from "@material-ui/core";
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  Link,
  Close
} from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { ReactEditor, useSlate } from 'slate-react';
import { Range, Editor, Transforms, Text } from 'slate';

const useStyles = makeStyles(theme => ({
  root: {
    background: theme.palette.common.black
  },
  button: {
    color: theme.palette.common.white,
    opacity: 0.75,
    "&:hover": {
      opacity: 1
    },
    paddingTop: 8,
    paddingBottom: 8
  },
  input: {
    color: theme.palette.common.white,
    padding: theme.spacing(0.25, 1)
  },
  close: {
    opacity: 0.75,
    cursor: "pointer",
    "&:hover": {
      opacity: 1
    }
  },
  container: {
    padding: '5px',
    position: 'absolute',
    zIndex: 1,
    top: '-10000px',
    left: '-10000px',
    marginTop: '-6px',
    opacity: 0,
    backgroundColor: '#222',
    borderRadius: '4px'
  }
}));

export interface ToolbarProps {}

export function Toolbar({}: ToolbarProps) {
  const [link, setLink] = useState<string>('');
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const [lastSelection, setLastSelection] = useState<Range|null>(null);
  const s = useStyles();
  const editor = useSlate();
  const ref: React.MutableRefObject<any> = useRef();

  useEffect(() => {
    const el: any = ref.current
    const { selection } = editor

    if (!el) {
      return;
    }

    if (selection) {
      setLastSelection(selection);
    }

    if (
      !selection ||
      !ReactEditor.isFocused(editor) ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === ''
    ) {
      if (!showUrlInput) {
        el.removeAttribute('style');
      }
      return;
    }

    const domSelection = window.getSelection();

    if (domSelection) {
      const domRange = domSelection.getRangeAt(0);
      const rect = domRange.getBoundingClientRect();

      el.style.opacity = '1';
      el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`;
      el.style.left = `${rect.left +
        window.pageXOffset -
        el.offsetWidth / 2 +
        rect.width / 2}px`;
    }
  })

  return (
    <div ref={ref} className={s.container}>
        {showUrlInput ? (
          /* URL input field */
          <form onSubmit={onUrlFormSubmit}>
            <Input
              className={s.input}
              type="url"
              value={link}
              onChange={onUrlInputChange}
              endAdornment={
                <Close
                  className={s.close}
                  fontSize="small"
                  onClick={onCloseUrlInput}
                />
              }
              placeholder="https://"
              disableUnderline
              fullWidth
              autoFocus
            />
          </form>
        ) : (
          /* Formatting controls */
          <ButtonGroup variant="text" color="primary">
            <IconButton className={s.button} size="small" onMouseDown={onBoldButtonMouseDown}>
              <FormatBold fontSize="small" />
            </IconButton>
            <IconButton className={s.button} size="small" onMouseDown={onItalicButtonMouseDown}>
              <FormatItalic fontSize="small" />
            </IconButton>
            <IconButton className={s.button} size="small" onMouseDown={onUnderlinedButtonMouseDown}>
              <FormatUnderlined fontSize="small" />
            </IconButton>
            <IconButton className={s.button} size="small" onMouseDown={onLinkButtonMouseDown}>
              <Link fontSize="small" />
            </IconButton>
          </ButtonGroup>
        )}
    </div>
  );

  function onBoldButtonMouseDown(event: MouseEvent) {
    event.preventDefault();
    toggleFormat(editor, 'bold');
  }

  function onItalicButtonMouseDown(event: MouseEvent) {
    event.preventDefault();
    toggleFormat(editor, 'italic');
  }

  function onUnderlinedButtonMouseDown(event: MouseEvent) {
    event.preventDefault();
    toggleFormat(editor, 'underlined');
  }

  function onLinkButtonMouseDown(event: MouseEvent) {
    event.preventDefault();
    const nodes: any = Editor.nodes(editor, {
      match: n => n.type === 'link',
    });

    for (const [node] of nodes) {
      if (node.url) {
        setLink(node.url);
      }
    }

    setShowUrlInput(true);
  }

  function onUrlInputChange(event: ChangeEvent) {
    event.preventDefault();
    setLink((event.target as HTMLInputElement).value);
  }

  function onUrlFormSubmit(event: FormEvent) {
    event.preventDefault();
    if (lastSelection) {
      editor.selection = lastSelection;

      if (link) {
        insertLink(editor, link);
        setLink('');
      } else {
        removeLink(editor);
      }

      setLastSelection(null);
      setShowUrlInput(false);
    }
  }

  function onCloseUrlInput(event: MouseEvent) {
    event.preventDefault();
    setLink('');
    setShowUrlInput(false);
  }

  function toggleFormat(editor: Editor, format: string) {
    Transforms.setNodes(
      editor,
      { [format]: isFormatActive(editor, format) ? null : true },
      { match: Text.isText, split: true }
    )
  }
  
  function isFormatActive(editor: Editor, format: string) {
    const [match]: any = Editor.nodes(editor, {
      match: n => n[format] === true,
      mode: 'all',
    });
    return !!match;
  }

  function insertLink(editor: Editor, url: string) {
    if (editor.selection) {
      if (isLinkActive(editor)) {
        removeLink(editor);
      }

      Transforms.setNodes(
        editor,
        { type: 'link', url, children: [] },
        { match: Text.isText, split: true }
      )
    }
  }

  function isLinkActive(editor: Editor) {
    const [match]: any = Editor.nodes(editor, {
      match: n => n.type === 'link',
    });
    return !!match;
  }

  function removeLink(editor: Editor) {
    Transforms.setNodes(
      editor,
      { type: 'paragraph', children: [{ text: '' }] },
      { match: Text.isText, split: true }
    )
  }
}
