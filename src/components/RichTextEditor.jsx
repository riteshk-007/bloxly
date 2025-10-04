'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Quote,
    Code,
    Link2,
    ImageIcon,
    Type,
    Heading1,
    Heading2,
    Heading3,
    Undo,
    Redo,
    Table as TableIcon,
    Plus,
    Trash2
} from 'lucide-react';

const MenuButton = ({ onClick, isActive, children, title }) => (
    <button
        type="button"
        onClick={onClick}
        className={`p-2 rounded hover:bg-gray-700 transition-colors ${isActive ? 'bg-yellow-500 text-black' : 'text-gray-300 hover:text-white'
            }`}
        title={title}
    >
        {children}
    </button>
);

const RichTextEditor = ({ content = '', onChange, placeholder = 'Write your content...' }) => {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder,
            }),
            Link.configure({
                openOnClick: false,
                autolink: true,
                HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
            }),
            Image,
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: 'tiptap-table',
                },
            }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange?.(html);
        },
    });

    // Force React re-render on selection/transaction so toolbar active states update immediately
    const [_, setTick] = React.useState(0);
    React.useEffect(() => {
        if (!editor) return;
        const update = () => setTick((t) => t + 1);
        editor.on('selectionUpdate', update);
        editor.on('transaction', update);
        return () => {
            editor.off('selectionUpdate', update);
            editor.off('transaction', update);
        };
    }, [editor]);

    // Keep editor content in sync when `content` prop changes (e.g., on edit page load)
    React.useEffect(() => {
        if (!editor) return;
        const current = editor.getHTML();
        if (content && content !== current) {
            editor.commands.setContent(content, false);
        }
        if (!content && current !== '') {
            editor.commands.clearContent();
        }
    }, [content, editor]);

    if (!editor) {
        return (
            <div className="min-h-[500px] w-full bg-gray-900 border border-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-gray-400">Loading editor...</div>
            </div>
        );
    }

    const addImage = () => {
        const url = window.prompt('Enter image URL:');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const addLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('Enter URL:', previousUrl);

        if (url === null) {
            return;
        }

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const insertDefaultTable = () => {
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    };

    const addRowAfter = () => {
        editor.chain().focus().addRowAfter().run();
    };

    const addColumnAfter = () => {
        editor.chain().focus().addColumnAfter().run();
    };

    const deleteTable = () => {
        editor.chain().focus().deleteTable().run();
    };

    const looksLikeMarkdownTable = (text) => {
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) return false;
        const header = lines[0];
        const sep = lines[1];
        return header.includes('|') && /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(sep);
    };

    const markdownTableToHtml = (text) => {
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) return null;
        const headerCells = lines[0]
            .replace(/^\|/, '')
            .replace(/\|$/, '')
            .split('|')
            .map(s => s.trim());
        const bodyLines = lines.slice(2);
        const rows = bodyLines.map(line => (
            line
                .replace(/^\|/, '')
                .replace(/\|$/, '')
                .split('|')
                .map(s => s.trim())
        ));

        const thead = '<thead><tr>' + headerCells.map(h => `<th>${h || ''}</th>`).join('') + '</tr></thead>';
        const tbody = '<tbody>' + rows.map(cols => {
            return '<tr>' + headerCells.map((_, i) => `<td>${(cols[i] || '')}</td>`).join('') + '</tr>';
        }).join('') + '</tbody>';
        return `<table>${thead}${tbody}</table>`;
    };

    return (
        <div className="border border-gray-800 rounded-lg bg-gray-900 overflow-hidden">
            {/* Toolbar */}
            <div className="border-b border-gray-800 p-3 bg-gray-800">
                <div className="flex items-center space-x-1 overflow-x-auto">
                    <MenuButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                        title="Bold"
                    >
                        <Bold className="w-4 h-4" />
                    </MenuButton>

                    <MenuButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                        title="Italic"
                    >
                        <Italic className="w-4 h-4" />
                    </MenuButton>

                    <MenuButton
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        isActive={editor.isActive('code')}
                        title="Inline Code"
                    >
                        <Code className="w-4 h-4" />
                    </MenuButton>

                    <div className="w-px h-6 bg-gray-600 mx-2" />

                    <MenuButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        isActive={editor.isActive('heading', { level: 1 })}
                        title="Heading 1"
                    >
                        <Heading1 className="w-4 h-4" />
                    </MenuButton>

                    <MenuButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        isActive={editor.isActive('heading', { level: 2 })}
                        title="Heading 2"
                    >
                        <Heading2 className="w-4 h-4" />
                    </MenuButton>

                    <MenuButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        isActive={editor.isActive('heading', { level: 3 })}
                        title="Heading 3"
                    >
                        <Heading3 className="w-4 h-4" />
                    </MenuButton>

                    <MenuButton
                        onClick={() => editor.chain().focus().setParagraph().run()}
                        isActive={editor.isActive('paragraph')}
                        title="Paragraph"
                    >
                        <Type className="w-4 h-4" />
                    </MenuButton>

                    <div className="w-px h-6 bg-gray-600 mx-2" />

                    <MenuButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive('bulletList')}
                        title="Bullet List"
                    >
                        <List className="w-4 h-4" />
                    </MenuButton>

                    <MenuButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive('orderedList')}
                        title="Numbered List"
                    >
                        <ListOrdered className="w-4 h-4" />
                    </MenuButton>

                    <MenuButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        isActive={editor.isActive('blockquote')}
                        title="Quote"
                    >
                        <Quote className="w-4 h-4" />
                    </MenuButton>

                    <div className="w-px h-6 bg-gray-600 mx-2" />

                    <MenuButton
                        onClick={insertDefaultTable}
                        isActive={editor.isActive('table')}
                        title="Insert 3x3 Table"
                    >
                        <TableIcon className="w-4 h-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={addRowAfter}
                        isActive={false}
                        title="Add Row"
                    >
                        <Plus className="w-4 h-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={addColumnAfter}
                        isActive={false}
                        title="Add Column"
                    >
                        <Plus className="w-4 h-4" />
                    </MenuButton>
                    <MenuButton
                        onClick={deleteTable}
                        isActive={false}
                        title="Delete Table"
                    >
                        <Trash2 className="w-4 h-4" />
                    </MenuButton>

                    <div className="w-px h-6 bg-gray-600 mx-2" />

                    <MenuButton
                        onClick={addLink}
                        isActive={editor.isActive('link')}
                        title="Add Link"
                    >
                        <Link2 className="w-4 h-4" />
                    </MenuButton>

                    <MenuButton
                        onClick={addImage}
                        isActive={false}
                        title="Add Image"
                    >
                        <ImageIcon className="w-4 h-4" />
                    </MenuButton>

                    <div className="w-px h-6 bg-gray-600 mx-2" />

                    <MenuButton
                        onClick={() => editor.chain().focus().undo().run()}
                        isActive={false}
                        title="Undo"
                    >
                        <Undo className="w-4 h-4" />
                    </MenuButton>

                    <MenuButton
                        onClick={() => editor.chain().focus().redo().run()}
                        isActive={false}
                        title="Redo"
                    >
                        <Redo className="w-4 h-4" />
                    </MenuButton>
                </div>
            </div>

            {/* Editor */}
            <EditorContent
                editor={editor}
                className="prose prose-invert max-w-none min-h-[500px] focus:outline-none"
                onPaste={(e) => {
                    if (!editor) return;
                    const text = e.clipboardData?.getData('text/plain') || '';
                    if (looksLikeMarkdownTable(text)) {
                        const html = markdownTableToHtml(text);
                        if (html) {
                            e.preventDefault();
                            editor.chain().focus().insertContent(html).run();
                        }
                    }
                }}
            />

            <style jsx global>{`
                .ProseMirror {
                    padding: 1rem;
                    min-height: 500px;
                    outline: none;
                    color: white;
                    background-color: rgb(17 24 39);
                }

                .ProseMirror h1 {
                    color: rgb(234 179 8);
                    font-size: 2rem;
                    font-weight: bold;
                    margin: 1rem 0;
                }

                .ProseMirror h2 {
                    color: rgb(234 179 8);
                    font-size: 1.5rem;
                    font-weight: bold;
                    margin: 0.75rem 0;
                }

                .ProseMirror h3 {
                    color: rgb(234 179 8);
                    font-size: 1.25rem;
                    font-weight: bold;
                    margin: 0.5rem 0;
                }

                .ProseMirror p {
                    color: white;
                    margin: 0.5rem 0;
                    line-height: 1.6;
                }

                .ProseMirror strong {
                    color: white;
                    font-weight: bold;
                }

                .ProseMirror em {
                    color: rgb(209 213 219);
                    font-style: italic;
                }

                .ProseMirror code {
                    background-color: rgb(31 41 55);
                    color: rgb(234 179 8);
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.25rem;
                    font-family: 'Courier New', monospace;
                }

                .ProseMirror blockquote {
                    border-left: 4px solid rgb(234 179 8);
                    padding-left: 1rem;
                    margin: 1rem 0;
                    color: rgb(209 213 219);
                    font-style: italic;
                }

                .ProseMirror ul, .ProseMirror ol {
                    padding-left: 1.5rem;
                    margin: 0.5rem 0;
                }

                /* Ensure list markers are visible with Tailwind prose */
                .ProseMirror ol { list-style-type: decimal; list-style-position: outside; }
                .ProseMirror ul { list-style-type: disc; list-style-position: outside; }
                .ProseMirror li { color: white; margin: 0.25rem 0; display: list-item; }
                .ProseMirror li::marker { color: white; }

                .ProseMirror a {
                    color: rgb(59 130 246);
                    text-decoration: underline;
                }

                .ProseMirror a:hover {
                    color: rgb(147 197 253);
                }

                .ProseMirror img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 0.5rem;
                    margin: 1rem 0;
                }

                /* Tables */
                .ProseMirror table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 1rem 0;
                }
                .ProseMirror th, .ProseMirror td {
                    border: 1px solid rgb(55 65 81);
                    padding: 0.5rem 0.75rem;
                    vertical-align: top;
                }
                .ProseMirror th {
                    background-color: rgb(31 41 55);
                    color: white;
                    font-weight: 600;
                }
                .ProseMirror tr:nth-child(even) td {
                    background-color: rgb(17 24 39);
                }
                .ProseMirror .selectedCell::after {
                    position: absolute;
                    z-index: 2;
                    content: "";
                    left: 0; right: 0; top: 0; bottom: 0;
                    background: rgba(234, 179, 8, 0.15);
                    pointer-events: none;
                }

                .ProseMirror .is-empty::before {
                    content: attr(data-placeholder);
                    color: rgb(107 114 128);
                    pointer-events: none;
                    height: 0;
                    float: left;
                }
            `}</style>
        </div>
    );
};

export default RichTextEditor;