import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';

// Import Material Icons or other icons
import BoldIcon from '@mui/icons-material/FormatBold';
import ItalicIcon from '@mui/icons-material/FormatItalic';
import SuperscriptIcon from '@mui/icons-material/Superscript';
import SubscriptIcon from '@mui/icons-material/Subscript';

const OptionEditor = ({ optionIndex, editMode, options, setOptions }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Subscript,
      Superscript,
      Bold,
      Italic,
    ],
    content: options[optionIndex - 1],
    editable: editMode,
    onUpdate: ({ editor }) => {
      const updatedOptions = [...options];
      updatedOptions[optionIndex - 1] = editor.getHTML();
      setOptions(updatedOptions);
    },
  });

  useEffect(() => {
    if (editor && options[optionIndex - 1] !== editor.getHTML()) {
      editor.commands.setContent(options[optionIndex - 1]);
    }
  }, [editor, optionIndex, options]);

  return (
    <div>
      {/* Custom Toolbar */}
      <div style={{ marginTop: '15px', border: '2px solid #ddd', padding: '2px', borderRadius: '4px' }}>
        <button onClick={() => editor.chain().focus().toggleBold().run()} style={toolbarButtonStyle}>
          <BoldIcon />
        </button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} style={toolbarButtonStyle}>
          <ItalicIcon />
        </button>
        <button onClick={() => editor.chain().focus().toggleSubscript().run()} style={toolbarButtonStyle}>
          <SubscriptIcon />
        </button>
        <button onClick={() => editor.chain().focus().toggleSuperscript().run()} style={toolbarButtonStyle}>
          <SuperscriptIcon />
        </button>
        {/* Add more buttons as needed */}
      </div>

      {/* Tiptap Editor */}
      <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '1px' }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

// Styling for toolbar buttons
const toolbarButtonStyle = {
  marginRight: '2px',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '2px',
  fontSize: '2px',
};

OptionEditor.propTypes = {
  optionIndex: PropTypes.number.isRequired,
  editMode: PropTypes.bool.isRequired,
  options: PropTypes.arrayOf(PropTypes.string).isRequired,
  setOptions: PropTypes.func.isRequired,
};

export default OptionEditor;
