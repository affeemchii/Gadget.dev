import { AutoTable } from "@gadgetinc/react/auto/polaris-wc";
import { api } from "../api";
import { useState, useRef } from "react";

type EditingProduct = {
  id: string;
  title: string;
  status: string;
  body: string;
};

// ── tiny SVG icon helpers ────────────────────────────────────────────────────
const Icon = ({ d, size = 14 }: { d: string; size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="currentColor"
    style={{ display: "block", flexShrink: 0 }}
  >
    <path d={d} />
  </svg>
);

// Common icon paths
const ICONS = {
  bold: "M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H8v14h5.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z",
  italic: "M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z",
  underline: "M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z",
  strike: "M6.85 7.08C6.85 4.37 9.45 3 12.24 3c1.64 0 3 .49 3.9 1.28.77.65 1.46 1.73 1.46 3.24h-2.44c0-.45-.16-1.25-.73-1.67-.39-.29-.97-.48-1.72-.48-1.64 0-2.4.89-2.4 1.9 0 .48.19.9.6 1.24.08.07.17.13.26.19H6.85v-.62zM21 12H3v2h9.62c1.15.45 1.96 1.17 1.96 2.38 0 1.59-1.31 2.73-3.29 2.73-1.52 0-2.93-.55-3.38-1.95H5.38C5.82 19.93 8.21 21 12.29 21c3.32 0 5.71-1.86 5.71-4.71 0-1.02-.34-1.94-.94-2.7H21v-1.59z",
  alignLeft: "M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z",
  alignCenter: "M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z",
  alignRight: "M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z",
  justify: "M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4v2h18V3H3z",
  ul: "M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z",
  ol: "M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-7v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z",
  outdent: "M11 17h10v-2H11v2zm-8-5 4 4V8l-4 4zm0 9h18v-2H3v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z",
  indent: "M3 17h10v-2H3v2zm8-10V3l-4 4 4 4V7zm8 8V9l-4 4 4 4zM3 13h10v-2H3v2zM3 3v2h10V3H3zm0 14h10v-2H3v2z",
  quote: "M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z",
  link: "M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z",
  image: "M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z",
  clear: "M3.27 5L2 6.27l6.97 6.97L6.5 19h3l1.57-3.66L16.73 21 18 19.73 3.55 5.27 3.27 5zM6 5v.18L8.82 8h2.4l-.72 1.68 2.1 2.1L14.21 8H20V5H6z",
  textColor: "M11 3L5.5 17h2.25l1.12-3h6.25l1.12 3h2.25L13 3h-2zm-1.38 9L12 5.67 14.38 12H9.62z",
  plus: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
};

// ── Font & size options ──────────────────────────────────────────────────────
const FONT_FAMILIES = [
  "Arial",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Verdana",
  "Trebuchet MS",
  "Impact",
  "Comic Sans MS",
];

const FONT_SIZES = ["10", "11", "12", "13", "14", "16", "18", "20", "24", "28", "32", "36", "48", "72"];

const HEADING_OPTIONS = [
  { label: "Paragraph", cmd: "formatBlock", val: "<p>" },
  { label: "Heading 1", cmd: "formatBlock", val: "<h1>" },
  { label: "Heading 2", cmd: "formatBlock", val: "<h2>" },
  { label: "Heading 3", cmd: "formatBlock", val: "<h3>" },
  { label: "Pre / Code", cmd: "formatBlock", val: "<pre>" },
  { label: "Blockquote", cmd: "formatBlock", val: "<blockquote>" },
];

export default function Index() {
  // ── edit-existing state ───────────────────────────────────────────────────
  const [editingProduct, setEditingProduct] = useState<EditingProduct | null>(null);
  const [status, setStatus] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  // ── add-product state ──────────────────────────────────────────────────────
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newVendor, setNewVendor] = useState("");
  const [newProductType, setNewProductType] = useState("");
  const [newStatus, setNewStatus] = useState("draft");
  const [newTags, setNewTags] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newSaving, setNewSaving] = useState(false);
  const [newSaveError, setNewSaveError] = useState<string | null>(null);
  const [newSaved, setNewSaved] = useState(false);

  // ── new-product toolbar active states ─────────────────────────────────────
  const [newBold, setNewBold] = useState(false);
  const [newItalic, setNewItalic] = useState(false);
  const [newUnderline, setNewUnderline] = useState(false);
  const [newStrike, setNewStrike] = useState(false);
  const [newTextColor, setNewTextColor] = useState("#000000");

  // ── edit toolbar active states ─────────────────────────────────────────────
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [strike, setStrike] = useState(false);
  const [textColor, setTextColor] = useState("#000000");

  const addModalRef = useRef<HTMLElement>(null);
  const editModalRef = useRef<HTMLElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const newEditorRef = useRef<HTMLDivElement>(null);

  // ── workaround for duplicate checkboxes in AutoTable ───────────────────────
  const autoTableWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Gadget AutoTable manually renders checkboxes, but also passes 'selectable' 
    // to the underlying s-table, causing duplicate checkbox columns.
    // We use a MutationObserver to forcefully remove the 'selectable' attribute 
    // from s-table so only the AutoTable checkboxes remain.
    const sTable = autoTableWrapperRef.current?.querySelector("s-table");
    if (!sTable) return;

    const hideInnerSelectable = () => {
      if (sTable.hasAttribute("selectable")) {
        sTable.removeAttribute("selectable");
      }
    };
    
    hideInnerSelectable();
    
    const observer = new MutationObserver(hideInnerSelectable);
    observer.observe(sTable, { attributes: true, attributeFilter: ["selectable"] });
    
    return () => observer.disconnect();
  });

  // ── open / close edit helpers ──────────────────────────────────────────────
  const openEdit = (record: any) => {
    setEditingProduct({
      id: record.id,
      title: record.title ?? "Untitled Product",
      status: record.status ?? "active",
      body: record.body ?? "",
    });
    setStatus(record.status ?? "active");
    setBody(record.body ?? "");
    setSaveError(null);
    setEditMode(true);

    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = record.body ?? "";
        syncFormats();
      }
    }, 60);
  };

  const closeEdit = () => {
    setEditingProduct(null);
    setSaveError(null);
    setEditMode(false);
  };

  // ── open / close add helpers ──────────────────────────────────────────────
  const openAddForm = () => {
    setNewTitle("");
    setNewVendor("");
    setNewProductType("");
    setNewStatus("draft");
    setNewTags("");
    setNewBody("");
    setNewSaveError(null);
    setNewSaved(false);
    setShowAddForm(true);
    setTimeout(() => {
      if (newEditorRef.current) newEditorRef.current.innerHTML = "";
    }, 60);
  };

  const closeAddForm = () => {
    setShowAddForm(false);
    (addModalRef.current as any)?.hideOverlay?.();
  };

  // ── save existing ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!editingProduct) return;
    setSaving(true);
    setSaveError(null);
    try {
      await api.shopifyProduct.update(editingProduct.id, {
        status,
        body,
      });
      (editModalRef.current as any)?.hideOverlay();
      closeEdit();
    } catch (err: any) {
      setSaveError(err?.message ?? "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── delete product ─────────────────────────────────────────────────────────
  const handleDelete = async (record: any) => {
    if (!confirm(`Delete "${record.title ?? "this product"}"? This cannot be undone.`)) return;
    try {
      await (api.shopifyProduct as any).delete(record.id);
    } catch (err: any) {
      alert(err?.message ?? "Failed to delete product. Please try again.");
    }
  };

  // ── create new ─────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!newTitle.trim()) {
      setNewSaveError("Product title is required.");
      return;
    }
    setNewSaving(true);
    setNewSaveError(null);
    try {
      await (api.shopifyProduct as any).create({
        title: newTitle.trim(),
        vendor: newVendor.trim() || undefined,
        productType: newProductType.trim() || undefined,
        status: newStatus,
        tags: newTags.trim() || undefined,
        body: newBody || undefined,
      });
      setNewSaved(true);
      setTimeout(() => {
        closeAddForm();
        setNewSaved(false);
      }, 1500);
    } catch (err: any) {
      setNewSaveError(err?.message ?? "Failed to create product. Please try again.");
    } finally {
      setNewSaving(false);
    }
  };

  // ── editor helpers (edit existing) ────────────────────────────────────────
  const exec = (cmd: string, val: string = "") => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    syncFormats();
    if (editorRef.current) {
      let html = editorRef.current.innerHTML;
      if (html === "<br>" || html === "" || html === "<p><br></p>") html = "";
      setBody(html);
    }
  };

  const syncFormats = () => {
    setBold(document.queryCommandState("bold"));
    setItalic(document.queryCommandState("italic"));
    setUnderline(document.queryCommandState("underline"));
    setStrike(document.queryCommandState("strikeThrough"));
  };

  const handleEditorInput = () => {
    if (!editorRef.current) return;
    let html = editorRef.current.innerHTML;
    if (html === "<br>" || html === "" || html === "<p><br></p>") html = "";
    setBody(html);
    syncFormats();
  };

  // ── insert image into editor ──────────────────────────────────────────────
  const insertImageToEditor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      editorRef.current?.focus();
      document.execCommand(
        "insertHTML",
        false,
        `<img src="${src}" alt="image" style="max-width:100%;border-radius:4px;margin:4px 0;" />`
      );
      handleEditorInput();
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ── editor helpers (add new product) ─────────────────────────────────────
  const execNew = (cmd: string, val: string = "") => {
    document.execCommand(cmd, false, val);
    newEditorRef.current?.focus();
    syncNewFormats();
    if (newEditorRef.current) {
      let html = newEditorRef.current.innerHTML;
      if (html === "<br>" || html === "" || html === "<p><br></p>") html = "";
      setNewBody(html);
    }
  };

  const syncNewFormats = () => {
    setNewBold(document.queryCommandState("bold"));
    setNewItalic(document.queryCommandState("italic"));
    setNewUnderline(document.queryCommandState("underline"));
    setNewStrike(document.queryCommandState("strikeThrough"));
  };

  const handleNewEditorInput = () => {
    if (!newEditorRef.current) return;
    let html = newEditorRef.current.innerHTML;
    if (html === "<br>" || html === "" || html === "<p><br></p>") html = "";
    setNewBody(html);
    syncNewFormats();
  };

  const insertImageToNewEditor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      newEditorRef.current?.focus();
      document.execCommand(
        "insertHTML",
        false,
        `<img src="${src}" alt="image" style="max-width:100%;border-radius:4px;margin:4px 0;" />`
      );
      handleNewEditorInput();
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div style={{ position: "relative" }}>
      {/* ── Fixed Action Button at Top Right of App Content ───────────────── */}
      <div style={{ position: "absolute", top: "24px", right: "24px", zIndex: 9999 }}>
        <button
          onClick={openAddForm}
          className="add-product-cta"
          style={{ boxShadow: "0 4px 12px rgba(0, 128, 96, 0.4)", transform: "scale(1.05)" }}
        >
          <Icon d={ICONS.plus} size={18} />
          Add Product
        </button>
      </div>

      <s-page heading="Products">
        {/* ════════════════════════════════════════════════════════════════
            ADD PRODUCT BUTTON — own section, outside shadow-DOM of table
        ════════════════════════════════════════════════════════════════ */}
      <s-section>
        <div className="add-product-bar">
          <div className="add-product-bar-left">
            <h2 className="add-product-bar-title">Product Inventory</h2>
            <p className="add-product-bar-sub">Add and manage products in your Shopify store</p>
          </div>
          <button
            id="add-product-btn"
            className="add-product-cta"
            onClick={openAddForm}
          >
            <Icon d={ICONS.plus} size={18} />
            Add Product
          </button>
        </div>
      </s-section>

      {/* ════════════════════════════════════════════════════════════════
          PRODUCTS TABLE
      ════════════════════════════════════════════════════════════════ */}
      <s-section>
        <div ref={autoTableWrapperRef}>
          <AutoTable
            //@ts-ignore
            model={api.shopifyProduct}
            columns={[
              "title",
              "status",
              "vendor",
              "productType",
              "publishedAt",
              {
                header: "Actions",
                render: ({ record }: { record: any }) => (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <s-button
                      commandFor="edit-product-modal"
                      onClick={(e: any) => { e.stopPropagation(); openEdit(record); }}
                    >
                      Edit Description
                    </s-button>
                    <s-button
                      tone="critical"
                      onClick={(e: any) => { e.stopPropagation(); handleDelete(record); }}
                    >
                      Delete
                    </s-button>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </s-section>

      {/* ════════════════════════════════════════════════════════════════════
          ADD PRODUCT MODAL
      ════════════════════════════════════════════════════════════════════ */}
      <s-modal
        ref={addModalRef as any}
        id="add-product-modal"
        heading="Add New Product"
        onHide={closeAddForm}
      >
        <s-box padding="large">
          <s-stack gap="large">

            {/* Success banner */}
            {newSaved && (
              <s-banner tone="success">
                <s-text>✅ Product created successfully!</s-text>
              </s-banner>
            )}

            {/* Error banner */}
            {newSaveError && (
              <s-banner tone="critical">
                <s-text>{newSaveError}</s-text>
              </s-banner>
            )}

            {/* Title */}
            <s-text-field
              label="Product Title *"
              value={newTitle}
              onChange={(e: any) => setNewTitle(e.target.value)}
              placeholder="e.g. Wireless Headphones Pro"
              id="new-product-title"
            />

            {/* Two-column row: Vendor + Product Type */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <s-text-field
                label="Vendor"
                value={newVendor}
                onChange={(e: any) => setNewVendor(e.target.value)}
                placeholder="e.g. Apple"
                id="new-product-vendor"
              />
              <s-text-field
                label="Product Type"
                value={newProductType}
                onChange={(e: any) => setNewProductType(e.target.value)}
                placeholder="e.g. Electronics"
                id="new-product-type"
              />
            </div>

            {/* Tags */}
            <s-text-field
              label="Tags"
              value={newTags}
              onChange={(e: any) => setNewTags(e.target.value)}
              placeholder="Comma-separated: sale, new-arrival, featured"
              id="new-product-tags"
            />

            {/* Status */}
            <s-select
              label="Status"
              value={newStatus}
              onChange={(e: any) => setNewStatus(e.target.value)}
              id="new-product-status"
            >
              <s-option value="active">🟢 Active</s-option>
              <s-option value="draft">🟡 Draft</s-option>
              <s-option value="archived">🔴 Archived</s-option>
            </s-select>

            {/* Description label */}
            <div>
              <p style={{ margin: "0 0 6px", fontSize: "13px", color: "#6d7175" }}>Description</p>

              {/* Rich text toolbar */}
              <div className="formatting-toolbar">
                <div className="toolbar-group">
                  <select className="toolbar-select toolbar-select-font" title="Font Family" defaultValue="Arial"
                    onChange={(e) => execNew("fontName", e.target.value)}>
                    {FONT_FAMILIES.map((f) => (
                      <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
                    ))}
                  </select>
                </div>

                <span className="toolbar-divider" />

                <div className="toolbar-group">
                  <select className="toolbar-select toolbar-select-size" title="Font Size" defaultValue="14"
                    onChange={(e) => {
                      execNew("fontSize", "7");
                      const el = document.querySelector("font[size='7']") as HTMLElement | null;
                      if (el) { el.removeAttribute("size"); el.style.fontSize = e.target.value + "px"; }
                    }}>
                    {FONT_SIZES.map((s) => <option key={s} value={s}>{s} px</option>)}
                  </select>
                </div>

                <span className="toolbar-divider" />

                <div className="toolbar-group">
                  <select className="toolbar-select toolbar-select-heading" title="Paragraph Style" defaultValue="<p>"
                    onChange={(e) => execNew("formatBlock", e.target.value)}>
                    {HEADING_OPTIONS.map((o) => <option key={o.val} value={o.val}>{o.label}</option>)}
                  </select>
                </div>

                <span className="toolbar-divider" />

                <div className="toolbar-group">
                  <button type="button" className={`toolbar-btn${newBold ? " active" : ""}`} title="Bold" onClick={() => execNew("bold")}><Icon d={ICONS.bold} /></button>
                  <button type="button" className={`toolbar-btn${newItalic ? " active" : ""}`} title="Italic" onClick={() => execNew("italic")}><Icon d={ICONS.italic} /></button>
                  <button type="button" className={`toolbar-btn${newUnderline ? " active" : ""}`} title="Underline" onClick={() => execNew("underline")}><Icon d={ICONS.underline} /></button>
                  <button type="button" className={`toolbar-btn${newStrike ? " active" : ""}`} title="Strikethrough" onClick={() => execNew("strikeThrough")}><Icon d={ICONS.strike} /></button>
                </div>

                <span className="toolbar-divider" />

                <div className="toolbar-group">
                  <label className="toolbar-color-wrap" title="Text Color">
                    <span className="toolbar-color-bar" style={{ color: newTextColor }}>A</span>
                    <span className="toolbar-color-swatch" style={{ background: newTextColor }} />
                    <input type="color" value={newTextColor} onChange={(e) => { setNewTextColor(e.target.value); execNew("foreColor", e.target.value); }} />
                  </label>
                </div>

                <span className="toolbar-divider" />

                <div className="toolbar-group">
                  <button type="button" className="toolbar-btn" title="Align Left" onClick={() => execNew("justifyLeft")}><Icon d={ICONS.alignLeft} /></button>
                  <button type="button" className="toolbar-btn" title="Align Center" onClick={() => execNew("justifyCenter")}><Icon d={ICONS.alignCenter} /></button>
                  <button type="button" className="toolbar-btn" title="Align Right" onClick={() => execNew("justifyRight")}><Icon d={ICONS.alignRight} /></button>
                  <button type="button" className="toolbar-btn" title="Justify" onClick={() => execNew("justifyFull")}><Icon d={ICONS.justify} /></button>
                </div>

                <span className="toolbar-divider" />

                <div className="toolbar-group">
                  <button type="button" className="toolbar-btn" title="Bullet List" onClick={() => execNew("insertUnorderedList")}><Icon d={ICONS.ul} /></button>
                  <button type="button" className="toolbar-btn" title="Numbered List" onClick={() => execNew("insertOrderedList")}><Icon d={ICONS.ol} /></button>
                  <button type="button" className="toolbar-btn" title="Decrease Indent" onClick={() => execNew("outdent")}><Icon d={ICONS.outdent} /></button>
                  <button type="button" className="toolbar-btn" title="Increase Indent" onClick={() => execNew("indent")}><Icon d={ICONS.indent} /></button>
                </div>

                <span className="toolbar-divider" />

                <div className="toolbar-group">
                  <button type="button" className="toolbar-btn" title="Blockquote" onClick={() => execNew("formatBlock", "<blockquote>")}><Icon d={ICONS.quote} /></button>
                  <button type="button" className="toolbar-btn" title="Insert Link"
                    onClick={() => { const url = prompt("Enter URL (include https://:"); if (url) execNew("createLink", url); }}>
                    <Icon d={ICONS.link} />
                  </button>
                  <label className="toolbar-btn" title="Insert Image" style={{ cursor: "pointer" }}>
                    <Icon d={ICONS.image} />
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={insertImageToNewEditor} />
                  </label>
                </div>

                <span className="toolbar-divider" />

                <div className="toolbar-group">
                  <button type="button" className="toolbar-btn" title="Clear Formatting" onClick={() => execNew("removeFormat")}>
                    <Icon d={ICONS.clear} />
                    <span style={{ fontSize: 11, marginLeft: 2 }}>Clear</span>
                  </button>
                </div>
              </div>

              {/* Rich text editor area */}
              <div
                ref={newEditorRef}
                contentEditable
                className="visual-editor"
                suppressContentEditableWarning
                onInput={handleNewEditorInput}
                onKeyUp={syncNewFormats}
                onMouseUp={syncNewFormats}
                data-placeholder="Write your product description here…"
                id="new-product-description"
              />
            </div>

          </s-stack>
        </s-box>

        {/* Primary action */}
        <div slot="primaryAction">
          <s-button
            id="create-product-submit-btn"
            variant="primary"
            loading={newSaving}
            onClick={handleCreate}
          >
            {newSaved ? "✅ Created!" : "Create Product"}
          </s-button>
        </div>

        {/* Secondary action */}
        <div slot="secondaryActions">
          <s-button id="cancel-add-product-btn" onClick={closeAddForm}>
            Cancel
          </s-button>
        </div>
      </s-modal>

      {/* ── Edit Modal ──────────────────────────────────────────────────── */}
      <s-modal
        ref={editModalRef as any}
        id="edit-product-modal"
        heading={
          editingProduct
            ? `Edit Description — ${editingProduct.title}`
            : "Edit Product"
        }
        onHide={closeEdit}
      >

        {editingProduct && editMode && (
          <s-box padding="base">
            <div className="modal-scroll-body">
              <s-stack gap="base">
                <s-text tone="neutral">
                  Use the toolbar below to style your description text:
                </s-text>

                {/* ──────────── TOOLBAR ──────────── */}
                <div className="formatting-toolbar">

                  {/* Font Family */}
                  <div className="toolbar-group">
                    <select
                      className="toolbar-select toolbar-select-font"
                      title="Font Family"
                      defaultValue="Arial"
                      onChange={(e) => exec("fontName", e.target.value)}
                    >
                      {FONT_FAMILIES.map((f) => (
                        <option key={f} value={f} style={{ fontFamily: f }}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>

                  <span className="toolbar-divider" />

                  {/* Font Size */}
                  <div className="toolbar-group">
                    <select
                      className="toolbar-select toolbar-select-size"
                      title="Font Size"
                      defaultValue="14"
                      onChange={(e) => {
                        exec("fontSize", "7");
                        const el = document.querySelector("font[size='7']") as HTMLElement | null;
                        if (el) {
                          el.removeAttribute("size");
                          el.style.fontSize = e.target.value + "px";
                        }
                      }}
                    >
                      {FONT_SIZES.map((s) => (
                        <option key={s} value={s}>{s} px</option>
                      ))}
                    </select>
                  </div>

                  <span className="toolbar-divider" />

                  {/* Heading / Paragraph style */}
                  <div className="toolbar-group">
                    <select
                      className="toolbar-select toolbar-select-heading"
                      title="Paragraph Style"
                      defaultValue="<p>"
                      onChange={(e) => exec("formatBlock", e.target.value)}
                    >
                      {HEADING_OPTIONS.map((o) => (
                        <option key={o.val} value={o.val}>{o.label}</option>
                      ))}
                    </select>
                  </div>

                  <span className="toolbar-divider" />

                  {/* Bold / Italic / Underline / Strikethrough */}
                  <div className="toolbar-group">
                    <button type="button" className={`toolbar-btn${bold ? " active" : ""}`} title="Bold (Ctrl+B)" onClick={() => exec("bold")}>          <Icon d={ICONS.bold} /></button>
                    <button type="button" className={`toolbar-btn${italic ? " active" : ""}`} title="Italic (Ctrl+I)" onClick={() => exec("italic")}>        <Icon d={ICONS.italic} /></button>
                    <button type="button" className={`toolbar-btn${underline ? " active" : ""}`} title="Underline (Ctrl+U)" onClick={() => exec("underline")}>     <Icon d={ICONS.underline} /></button>
                    <button type="button" className={`toolbar-btn${strike ? " active" : ""}`} title="Strikethrough" onClick={() => exec("strikeThrough")}> <Icon d={ICONS.strike} /></button>
                  </div>

                  <span className="toolbar-divider" />

                  {/* Text Color */}
                  <div className="toolbar-group">
                    <label className="toolbar-color-wrap" title="Text Color">
                      <span className="toolbar-color-bar" style={{ color: textColor }}>A</span>
                      <span className="toolbar-color-swatch" style={{ background: textColor }} />
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => {
                          setTextColor(e.target.value);
                          exec("foreColor", e.target.value);
                        }}
                      />
                    </label>
                  </div>

                  <span className="toolbar-divider" />

                  {/* Alignment */}
                  <div className="toolbar-group">
                    <button type="button" className="toolbar-btn" title="Align Left" onClick={() => exec("justifyLeft")}>   <Icon d={ICONS.alignLeft} /></button>
                    <button type="button" className="toolbar-btn" title="Align Center" onClick={() => exec("justifyCenter")}> <Icon d={ICONS.alignCenter} /></button>
                    <button type="button" className="toolbar-btn" title="Align Right" onClick={() => exec("justifyRight")}>  <Icon d={ICONS.alignRight} /></button>
                    <button type="button" className="toolbar-btn" title="Justify" onClick={() => exec("justifyFull")}>   <Icon d={ICONS.justify} /></button>
                  </div>

                  <span className="toolbar-divider" />

                  {/* Lists & Indent */}
                  <div className="toolbar-group">
                    <button type="button" className="toolbar-btn" title="Bullet List" onClick={() => exec("insertUnorderedList")}> <Icon d={ICONS.ul} /></button>
                    <button type="button" className="toolbar-btn" title="Numbered List" onClick={() => exec("insertOrderedList")}>   <Icon d={ICONS.ol} /></button>
                    <button type="button" className="toolbar-btn" title="Decrease Indent" onClick={() => exec("outdent")}>           <Icon d={ICONS.outdent} /></button>
                    <button type="button" className="toolbar-btn" title="Increase Indent" onClick={() => exec("indent")}>            <Icon d={ICONS.indent} /></button>
                  </div>

                  <span className="toolbar-divider" />

                  {/* Quote / Link / Image */}
                  <div className="toolbar-group">
                    <button
                      type="button"
                      className="toolbar-btn"
                      title="Blockquote"
                      onClick={() => exec("formatBlock", "<blockquote>")}
                    >
                      <Icon d={ICONS.quote} />
                    </button>

                    <button
                      type="button"
                      className="toolbar-btn"
                      title="Insert Link"
                      onClick={() => {
                        const url = prompt("Enter URL (include https://):");
                        if (url) exec("createLink", url);
                      }}
                    >
                      <Icon d={ICONS.link} />
                    </button>

                    {/* Image insert via hidden file input */}
                    <label className="toolbar-btn" title="Insert Image" style={{ cursor: "pointer" }}>
                      <Icon d={ICONS.image} />
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={insertImageToEditor}
                      />
                    </label>
                  </div>

                  <span className="toolbar-divider" />

                  {/* Clear Formatting */}
                  <div className="toolbar-group">
                    <button
                      type="button"
                      className="toolbar-btn"
                      title="Clear Formatting"
                      onClick={() => exec("removeFormat")}
                    >
                      <Icon d={ICONS.clear} />
                      <span style={{ fontSize: 11, marginLeft: 2 }}>Clear</span>
                    </button>
                  </div>
                </div>

                {/* ──────────── EDITOR AREA ──────────── */}
                <div
                  ref={editorRef}
                  contentEditable
                  className="visual-editor"
                  suppressContentEditableWarning
                  onInput={handleEditorInput}
                  onKeyUp={syncFormats}
                  onMouseUp={syncFormats}
                />
              </s-stack>
            </div>
          </s-box>
        )}

        {/* Error banner */}
        {editingProduct && saveError && (
          <s-box padding="large">
            <s-banner tone="critical">
              <s-text>{saveError}</s-text>
            </s-banner>
          </s-box>
        )}

        {/* Primary action */}
        <div slot="primaryAction">
          <s-button variant="primary" loading={saving} onClick={handleSave}>
            Save
          </s-button>
        </div>

        {/* Secondary action */}
        <div slot="secondaryActions">
          <s-button commandFor="edit-product-modal" command="--hide" onClick={closeEdit}>
            Cancel
          </s-button>
        </div>
      </s-modal>
    </s-page>
    </div>
  );
}
