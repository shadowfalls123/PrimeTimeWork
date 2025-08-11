import React, { useEffect, useRef, useState } from "react";
import logger from "../../util/logger";
import PropTypes from "prop-types";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Image from "@tiptap/extension-image";
import BoldIcon from "@mui/icons-material/FormatBold";
import ItalicIcon from "@mui/icons-material/FormatItalic";
import SuperscriptIcon from "@mui/icons-material/Superscript";
import SubscriptIcon from "@mui/icons-material/Subscript";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import ImageIcon from "@mui/icons-material/Image";
//import CloseIcon from '@mui/icons-material/Close'; // Import the close icon
import { Typography, Box, Button } from "@mui/material";

const RichTextEditor = ({
  label,
  content,
  editMode,
  onContentChange,
 // onImageChange,
  error,
  helperText,
}) => {
  // logger.log("editMode -->> ", editMode); // Print the value of editMode
  const [imageData, setImageData] = useState(null); // State to hold image data

  // Custom Image Extension
const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      src: {
        default: null,
        parseHTML: (element) => element.getAttribute("src"),
        renderHTML: (attributes) => {
          if (!attributes.src) {
            return {};
          }
          return {
            src: attributes.src,
          };
        },
      },
      alt: {
        default: null,
        parseHTML: (element) => element.getAttribute("alt"),
        renderHTML: (attributes) => {
          return {
            alt: attributes.alt,
          };
        },
      },
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute("style"),
        renderHTML: (attributes) => {
          return {
            style: attributes.style,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "img[src]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["img", HTMLAttributes];
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement("div");
      dom.style.position = "relative";
      dom.style.display = "inline-block";

      const img = document.createElement("img");
      img.src = node.attrs.src;
      img.style.width = "300px";
      img.style.height = "auto";
      img.style.maxHeight = "200px";
      dom.appendChild(img);

//      if (editMode) { // Only show the close icon if editMode is true
      const closeIcon = document.createElement("span");
      closeIcon.style.position = "absolute";
      closeIcon.style.top = "-10px";
      closeIcon.style.right = "-10px";
      closeIcon.style.backgroundColor = "white";
      closeIcon.style.borderRadius = "50%";
      closeIcon.style.cursor = "pointer";
      closeIcon.style.zIndex = "10";
      closeIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 96 960 960" width="24"><path d="M480 736l-145 145q-8.615 8.5-19.5 8.5-10.885 0-19.5-8.5Q288 872.615 288 862.5q0-10.115 8.5-19.5L441 696 296 551q-8.5-8.385-8.5-19.5 0-11.115 8.5-19.5 8.5-8.5 19.5-8.5 11 0 19.5 8.5L480 661l145-145q8.5-8.5 19.5-8.5 11 0 19.5 8.5 8.5 8.5 8.5 19.5 0 11.115-8.5 19.5L519 696l145 145q8.5 8.5 8.5 19.5t-8.5 19.5q-8.5 8.5-19.5 8.5-10.885 0-19.5-8.5L480 736z"/></svg>`;

      closeIcon.onclick = () => {
        const { tr } = editor.state;
        const pos = getPos();
        editor.view.dispatch(tr.deleteRange(pos, pos + node.nodeSize));
      };
      dom.appendChild(closeIcon);
//    }
      return {
        dom,
      };
    };
  },
});

  const editor = useEditor({
    extensions: [
      StarterKit,
      Subscript,
      Superscript,
      CustomImage.configure({ inline: true }), // Use the custom image extension
    ],
    content: content,
    editable: editMode,
    onUpdate: ({ editor }) => {
      // logger.log("[editor] editMode:", editMode);
      //      onContentChange(editor.getHTML());
      const htmlContent = editor.getHTML();
      // logger.log("Updated HTML Content:", htmlContent);
      onContentChange(htmlContent);

      // Extract image source URLs
      // const imageElements = editor.getJSON().content.filter((item) => item.type === "image");
      // const imageUrls = imageElements.map((img) => img.attrs.src);
      // logger.log("Extracted Image URLs:", imageUrls);
/*      if (imageUrls.length > 0) {
        onImageChange(imageUrls); // Pass image data to parent
      } else {
        onImageChange(null); // No images, pass null
      }
*/
      // const { textWithHtmlTags, images } =
      //   extractTextWithHtmlTagsAndImages(htmlContent);

      // logger.log("Text with HTML Tags:", textWithHtmlTags);
      // logger.log("Image URLs:", images);
    },
  });

  // // Function to extract text with HTML tags and images from HTML content
  // function extractTextWithHtmlTagsAndImages(htmlContent) {
  //   // Create a temporary DOM element to parse HTML
  //   const parser = new DOMParser();
  //   const doc = parser.parseFromString(htmlContent, "text/html");

  //   // Function to recursively get HTML content and ignore images
  //   function getHtmlWithText(node) {
  //     let html = "";
  //     node.childNodes.forEach((child) => {
  //       if (child.nodeType === Node.ELEMENT_NODE) {
  //         // Handle element nodes
  //         if (child.tagName.toLowerCase() === "img") {
  //           // Skip images for text extraction
  //           return;
  //         } else {
  //           html += `<${child.tagName.toLowerCase()}>${getHtmlWithText(
  //             child
  //           )}</${child.tagName.toLowerCase()}>`;
  //         }
  //       } else if (child.nodeType === Node.TEXT_NODE) {
  //         // Handle text nodes
  //         html += child.textContent;
  //       }
  //     });
  //     return html;
  //   }

  //   // Extract text with HTML tags
  //   const textWithHtmlTags = getHtmlWithText(doc.body).trim();

  //   // Extract image URLs
  //   const images = Array.from(doc.querySelectorAll("img")).map(
  //     (img) => img.src
  //   );

  //   // Return extracted text and image URLs
  //   return {
  //     textWithHtmlTags,
  //     images,
  //   };
  // }

  const fileInputRef = useRef(null);

  // Reinitialize the editor when editMode changes
useEffect(() => {
  if (editor) {
    editor.setOptions({ editable: editMode });
  }
}, [editMode, editor]);

useEffect(() => {
  // logger.log("Updated imageData is -->> ", imageData);
}, [imageData]);

  useEffect(() => {
    // logger.log("Received editor:", editor);
    // logger.log("Received editor.getHTML():", editor.getHTML());
    // logger.log("Received content prop:", content);
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const image = new window.Image();
        image.src = reader.result;

        image.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_SIZE = 10 * 1024; // 50kb in bytes
          let width = image.width;
          let height = image.height;
          let ratio = Math.sqrt(MAX_SIZE / file.size);

          width *= ratio;
          height *= ratio;

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(image, 0, 0, width, height);

          let quality = 0.8; // Initial quality setting
          let base64 = canvas.toDataURL("image/jpeg", quality);

          // Adjust quality until the image is below 50kb
          while (base64.length > MAX_SIZE && quality > 0.1) {
            quality -= 0.05;
            base64 = canvas.toDataURL("image/jpeg", quality);
          }

          setImageData(base64); // Save image data to state
          // logger.log("base64 -->> ", base64);
          logger.log("imageData is -->> ", imageData);

          if (editor) {
            const imageId = `image-${Math.random().toString(36).substr(2, 9)}`;
            editor.chain().focus().setImage({ src: base64, id: imageId, width: 300, height: 200 }).run();
          }
        };
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box>
      <style>
        {`
          .ProseMirror img {
            width: 300px !important;
            height: auto !important;
            max-height: 200px !important;
          }
          .ProseMirror .image-container .remove-image {
            display: flex;
            align-items: center;
            justify-content: center;
          }
        `}
      </style>

      {/* Label */}
      <Typography variant="caption" display="block" gutterBottom>
        {label}
      </Typography>

      {/* Conditional Toolbar */}
      {editMode && (
        <Box mb={1} border="1px solid #ddd" p={1} borderRadius="4px">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            style={toolbarButtonStyle}
          >
            <BoldIcon />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            style={toolbarButtonStyle}
          >
            <ItalicIcon />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            style={toolbarButtonStyle}
          >
            <SubscriptIcon />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            style={toolbarButtonStyle}
          >
            <SuperscriptIcon />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            style={toolbarButtonStyle}
          >
            <FormatListBulletedIcon />
          </button>
          <input
            ref={fileInputRef}
            accept="image/*"
            type="file"
            style={{ display: "none" }}
            onChange={handleImageUpload}
          />
          <Button
            variant="contained"
            component="span"
            onClick={() => fileInputRef.current.click()}
          >
            <ImageIcon />
          </Button>
        </Box>
      )}

      {/* Tiptap Editor */}
      <div
        style={{
          border: error ? "1px solid red" : "1px solid #ddd",
          borderRadius: "4px",
          padding: "1px",
          backgroundColor: editMode ? "#fff" : "#f9f9f9",
          color: editMode ? "#000" : "#aaa",
        }}
      >
        <Box border="1px solid #ddd" borderRadius="4px" p={1}>
          <EditorContent
            editor={editor}
            style={{
              color: editMode ? "inherit" : "#9e9e9e",
              minHeight: "56px",
              padding: "4px",
            }}
          />
          {/* <div dangerouslySetInnerHTML={{ __html: content }} /> */}
        </Box>
      </div>

      {helperText && (
        <div style={{ color: "red", marginTop: "4px" }}>{helperText}</div>
      )}
    </Box>
  );
};

// Styling for toolbar buttons
const toolbarButtonStyle = {
  marginRight: "2px",
  backgroundColor: "transparent",
  border: "none",
  cursor: "pointer",
  padding: "2px",
  fontSize: "16px",
};

RichTextEditor.propTypes = {
  label: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  editMode: PropTypes.bool.isRequired,
  onContentChange: PropTypes.func.isRequired,
//  onImageChange: PropTypes.func, // New prop for image data
  error: PropTypes.bool, // Boolean to indicate if there's an error
  helperText: PropTypes.string, // String to provide error message
};

export default RichTextEditor;
