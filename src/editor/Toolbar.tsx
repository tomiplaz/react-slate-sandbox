import React, {
  useState,
  useEffect,
  useRef
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
    padding: '8px 7px 6px',
    position: 'absolute',
    zIndex: 1,
    top: '-10000px',
    left: '-10000px',
    marginTop: '-6px',
    opacity: 0,
    backgroundColor: '#222',
    borderRadius: '4px',
    transition: 'opacity 0.75s'
  }
}));

export interface ToolbarProps {}

export function Toolbar(props: ToolbarProps) {
  const [link, setLink] = useState('');
  const s = useStyles();

  const ref : any = useRef()
  const editor = useSlate()

  useEffect(() => {
    const el : any = ref.current
    const { selection } = editor

    if (!el) {
      return
    }

    if (
      !selection ||
      !ReactEditor.isFocused(editor) ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === ''
    ) {
      el.removeAttribute('style')
      return
    }

    const domSelection = window.getSelection();

    if (domSelection) {
      const domRange = domSelection.getRangeAt(0)
      const rect = domRange.getBoundingClientRect()
      el.style.opacity = 1
      el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`
      el.style.left = `${rect.left +
        window.pageXOffset -
        el.offsetWidth / 2 +
        rect.width / 2}px`
    }
  })

  return (
    <div ref={ref} className={s.container}>
        {!link ? (
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
        ) : (
          /* URL input field */
          <form onSubmit={x => x.preventDefault()}>
            <Input
              className={s.input}
              type="url"
              value={link}
              onChange={x => setLink(x.target.value)}
              endAdornment={
                <Close
                  className={s.close}
                  fontSize="small"
                  onClick={() => setLink('')}
                />
              }
              placeholder="https://"
              disableUnderline
              fullWidth
              autoFocus
            />
          </form>
        )}
    </div>
  );

  function onBoldButtonMouseDown(event: any) {
    event.preventDefault();
    toggleFormat(editor, 'bold');
  }

  function onItalicButtonMouseDown(event: any) {
    event.preventDefault();
    toggleFormat(editor, 'italic');
  }

  function onUnderlinedButtonMouseDown(event: any) {
    event.preventDefault();
    toggleFormat(editor, 'underlined');
  }

  function onLinkButtonMouseDown(event: any) {
    event.preventDefault();
    insertLink(editor, 'https://www.google.com');
  }

  function toggleFormat(editor: any, format: any) {
    Transforms.setNodes(
      editor,
      { [format]: isFormatActive(editor, format) ? null : true },
      { match: Text.isText, split: true }
    )
  }
  
  function isFormatActive(editor: any, format: any) {
    const [match]: any = Editor.nodes(editor, {
      match: n => n[format] === true,
      mode: 'all',
    });
    return !!match;
  }

  function insertLink(editor: any, url: string) {
    if (editor.selection) {
      wrapLink(editor, url);
    }
  }
}

export function wrapLink(editor: any, url: string) {
  if (isLinkActive(editor)) {
    unwrapLink(editor);
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);
  const link = {
    type: 'link',
    url,
    children: isCollapsed ? [{ text: url }] : [],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, link);
  } else {
    Transforms.setNodes(
      editor,
      link,
      { match: Text.isText, split: true }
    )
    //Transforms.wrapNodes(editor, link, { split: true });
    //Transforms.collapse(editor, { edge: 'end' });
  }
};

function isLinkActive(editor: any) {
  const [match]: any = Editor.nodes(editor, {
    match: n => n.type === 'link',
  });
  return !!match;
}

function unwrapLink(editor: any) {
  Transforms.unwrapNodes(editor, {
    match: n => n.type === 'link'
  });
}
