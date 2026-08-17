import { useCallback, useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { Placeholder } from '@tiptap/extensions';
import { Bold, Italic, List, ImagePlus, Loader2, Sigma } from 'lucide-react';
import * as adminService from '@/services/adminService';
import { getErrorMessage } from '@/services/http';
import { cx } from '@/shared/utils/cx';
import { MathInlineNode } from './extensions/MathInlineNode';
import type { MathEditRequest } from './extensions/MathInlineNode';
import { MathFormulaModal } from './MathFormulaModal';
import 'katex/dist/katex.min.css';
import './RichTextEditor.css';

type RichTextEditorProps = {
  label: string;
  /** Rótulo extra exibido ao lado do label ("(opcional)" / "(obrigatório)"). */
  labelSuffix?: string;
  required?: boolean;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
};

type MathModalState = {
  open: boolean;
  initialLatex: string;
  update?: (latex: string) => void;
};

/**
 * RF16/RF17/RF18 — editor de texto rico (Tiptap) usado no enunciado e na
 * resolução em texto. Salva/carrega HTML (RN21); fórmulas via MathLive em node
 * customizado (`span[data-latex]`); imagens sempre via upload intermediado
 * pelo backend (RN23), nunca base64 local.
 */
export function RichTextEditor({
  label,
  labelSuffix,
  required = false,
  value,
  onChange,
  placeholder,
  hint,
  error,
}: RichTextEditorProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [mathModal, setMathModal] = useState<MathModalState>({ open: false, initialLatex: '' });

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const editorRef = useRef<Editor | null>(null);

  /** Handler estável para paste/drop (capturado na criação do editor). */
  const uploadAndInsertRef = useRef<(file: File, pos?: number) => Promise<void>>(async () => {});

  /** Posição do cursor quando o modal de fórmula foi aberto para inserção. */
  const mathInsertPosRef = useRef<number | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Image.configure({ allowBase64: false }),
      Placeholder.configure({ placeholder: placeholder ?? '' }),
      MathInlineNode.configure({
        onEdit: (request: MathEditRequest) => {
          // Tirar o foco do editor evita que teclas digitadas no modal
          // vazem para o texto e destruam o node selecionado.
          editorRef.current?.commands.blur();
          setMathModal({ open: true, initialLatex: request.latex, update: request.update });
        },
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        'aria-label': label,
        class: 'rte-surface',
      },
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []);
        if (files.length === 0) return false;
        event.preventDefault();
        files.forEach((file) => uploadAndInsertRef.current(file));
        return true;
      },
      handleDrop: (view, event, _slice, moved) => {
        if (moved) return false;
        const files = Array.from(event.dataTransfer?.files ?? []);
        if (files.length === 0) return false;
        const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
        event.preventDefault();
        files.forEach((file) => uploadAndInsertRef.current(file, coords?.pos));
        return true;
      },
    },
    onUpdate: ({ editor: current }) => onChangeRef.current(current.getHTML()),
  });

  editorRef.current = editor;

  // Sincroniza conteúdo externo (ex.: carga de questão existente / reset do form).
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [value, editor]);

  const uploadAndInsert = useCallback(
    async (file: File, pos?: number) => {
      if (!editor || uploading) return;

      setUploading(true);
      setUploadError(null);
      try {
        const url = await adminService.uploadImage(file);
        if (pos != null) {
          editor.chain().focus().insertContentAt(pos, {
            type: 'image',
            attrs: { src: url, alt: file.name },
          }).run();
        } else {
          editor.chain().focus().setImage({ src: url, alt: file.name }).run();
        }
      } catch (err) {
        setUploadError(
          getErrorMessage(err, 'Não foi possível enviar a imagem. Tente novamente.')
        );
      } finally {
        setUploading(false);
      }
    },
    [editor, uploading]
  );

  // Handler estável para paste/drop (capturado na criação do editor).
  uploadAndInsertRef.current = uploadAndInsert;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void uploadAndInsert(file);
    event.target.value = '';
  };

  const openMathModalForInsert = () => {
    if (!editor) return;
    mathInsertPosRef.current = editor.state.selection.to;
    // O modal rouba o foco; sem isso, teclas poderiam vazar para o editor.
    editor.commands.blur();
    setMathModal({ open: true, initialLatex: '' });
  };

  const handleMathConfirm = (latex: string) => {
    if (!editor || !latex.trim()) {
      setMathModal({ open: false, initialLatex: '' });
      return;
    }

    if (mathModal.update) {
      mathModal.update(latex);
    } else if (mathInsertPosRef.current != null) {
      editor
        .chain()
        .focus()
        .insertContentAt(mathInsertPosRef.current, {
          type: 'mathInline',
          attrs: { latex },
        })
        .run();
    }

    setMathModal({ open: false, initialLatex: '' });
  };

  if (!editor) {
    return null;
  }

  return (
    <div className={cx('rte', error && 'rte--error')}>
      <label className="rte-label">
        {label}
        {required && <span className="rte-req" aria-hidden="true"> *</span>}
        {labelSuffix && <span className="rte-label-suffix"> {labelSuffix}</span>}
      </label>

      <div className="rte-box">
        <div className="rte-toolbar" role="toolbar" aria-label={`Ferramentas do campo ${label}`}>
          <button
            type="button"
            className={cx('rte-tool', editor.isActive('bold') && 'rte-tool--active')}
            title="Negrito"
            aria-label="Negrito"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold size={16} />
          </button>
          <button
            type="button"
            className={cx('rte-tool', editor.isActive('italic') && 'rte-tool--active')}
            title="Itálico"
            aria-label="Itálico"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic size={16} />
          </button>
          <button
            type="button"
            className={cx('rte-tool', editor.isActive('bulletList') && 'rte-tool--active')}
            title="Lista com marcadores"
            aria-label="Lista com marcadores"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List size={16} />
          </button>
          <button
            type="button"
            className="rte-tool"
            title="Inserir imagem"
            aria-label="Inserir imagem"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? <Loader2 size={16} className="rte-spin" /> : <ImagePlus size={16} />}
          </button>
          <button type="button" className="rte-tool rte-tool--formula" title="Inserir fórmula (MathLive)" onClick={openMathModalForInsert}>
            <Sigma size={16} /> Inserir fórmula
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={handleFileSelected}
          />
        </div>

        <EditorContent editor={editor} />
      </div>

      {hint && <p className="rte-hint">{hint}</p>}
      {error && <p className="rte-error" role="alert">{error}</p>}
      {uploadError && <p className="rte-error" role="alert">{uploadError}</p>}

      {mathModal.open && (
        <MathFormulaModal
          initialLatex={mathModal.initialLatex}
          onConfirm={handleMathConfirm}
          onCancel={() => setMathModal({ open: false, initialLatex: '' })}
        />
      )}
    </div>
  );
}
