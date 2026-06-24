import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { api } from "../api";

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

const ICONS = {
  bold:        "M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H8v14h5.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z",
  italic:      "M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z",
  underline:   "M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z",
  strike:      "M6.85 7.08C6.85 4.37 9.45 3 12.24 3c1.64 0 3 .49 3.9 1.28.77.65 1.46 1.73 1.46 3.24h-2.44c0-.45-.16-1.25-.73-1.67-.39-.29-.97-.48-1.72-.48-1.64 0-2.4.89-2.4 1.9 0 .48.19.9.6 1.24.08.07.17.13.26.19H6.85v-.62zM21 12H3v2h9.62c1.15.45 1.96 1.17 1.96 2.38 0 1.59-1.31 2.73-3.29 2.73-1.52 0-2.93-.55-3.38-1.95H5.38C5.82 19.93 8.21 21 12.29 21c3.32 0 5.71-1.86 5.71-4.71 0-1.02-.34-1.94-.94-2.7H21v-1.59z",
  alignLeft:   "M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z",
  alignCenter: "M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z",
  alignRight:  "M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z",
  ul:          "M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z",
  ol:          "M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-7v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z",
  link:        "M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z",
  image:       "M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z",
  clear:       "M3.27 5L2 6.27l6.97 6.97L6.5 19h3l1.57-3.66L16.73 21 18 19.73 3.55 5.27 3.27 5zM6 5v.18L8.82 8h2.4l-.72 1.68 2.1 2.1L14.21 8H20V5H6z",
  arrowLeft:   "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z",
  check:       "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
};

const FONT_FAMILIES = ["Arial","Georgia","Times New Roman","Courier New","Verdana","Trebuchet MS","Impact","Comic Sans MS"];
const FONT_SIZES    = ["10","11","12","13","14","16","18","20","24","28","32","36","48","72"];
const HEADING_OPTIONS = [
  { label: "Paragraph",  val: "<p>" },
  { label: "Heading 1",  val: "<h1>" },
  { label: "Heading 2",  val: "<h2>" },
  { label: "Heading 3",  val: "<h3>" },
  { label: "Pre / Code", val: "<pre>" },
  { label: "Blockquote", val: "<blockquote>" },
];

export default function NewProduct() {
  const navigate = useNavigate();

  // Form fields
  const [title,       setTitle]       = useState("");
  const [vendor,      setVendor]      = useState("");
  const [productType, setProductType] = useState("");
  const [status,      setStatus]      = useState("draft");
  const [tags,        setTags]        = useState("");
  const [body,        setBody]        = useState("");

  // UI state
  const [saving,     setSaving]     = useState(false);
  const [saveError,  setSaveError]  = useState<string | null>(null);
  const [saved,      setSaved]      = useState(false);

  // Rich text toolbar state
  const [bold,      setBold]      = useState(false);
  const [italic,    setItalic]    = useState(false);
  const [underline, setUnderline] = useState(false);
  const [strike,    setStrike]    = useState(false);
  const [textColor, setTextColor] = useState("#000000");

  const editorRef = useRef<HTMLDivElement>(null);

  // ── editor helpers ─────────────────────────────────────────────────────────
  const exec = (cmd: string, val = "") => {
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

  const insertImageToEditor = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      editorRef.current?.focus();
      document.execCommand("insertHTML", false, `<img src="${src}" alt="image" style="max-width:100%;border-radius:4px;margin:4px 0;" />`);
      handleEditorInput();
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ── submit ─────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!title.trim()) {
      setSaveError("Product title is required.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      await (api.shopifyProduct as any).create({
        title: title.trim(),
        vendor: vendor.trim() || undefined,
        productType: productType.trim() || undefined,
        status,
        tags: tags.trim() || undefined,
        body: body || undefined,
      });
      setSaved(true);
      // Brief success pause then navigate back
      setTimeout(() => navigate("/"), 1200);
    } catch (err: any) {
      setSaveError(err?.message ?? "Failed to create product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <s-page heading="Add New Product">

      {/* ── Back button row ───────────────────────────────────────────────── */}
      <div slot="primaryAction">
        <s-button
          variant="primary"
          loading={saving}
          onClick={handleCreate}
          id="create-product-btn"
        >
          {saved ? <><Icon d={ICONS.check} size={16} /> Saved!</> : "Create Product"}
        </s-button>
      </div>

      <div slot="secondaryActions">
        <s-button onClick={() => navigate("/")} id="cancel-new-product-btn">
          Cancel
        </s-button>
      </div>

      {/* ── Error banner ──────────────────────────────────────────────────── */}
      {saveError && (
        <s-section>
          <s-box padding="base">
            <s-banner tone="critical">
              <s-text>{saveError}</s-text>
            </s-banner>
          </s-box>
        </s-section>
      )}

      {/* ── Success banner ────────────────────────────────────────────────── */}
      {saved && (
        <s-section>
          <s-box padding="base">
            <s-banner tone="success">
              <s-text>Product created! Redirecting to products list…</s-text>
            </s-banner>
          </s-box>
        </s-section>
      )}

      {/* ── Basic Info ────────────────────────────────────────────────────── */}
      <s-section heading="Basic Information">
        <s-box padding="large">
          <s-stack gap="large">

            {/* Title */}
            <s-text-field
              label="Product Title *"
              value={title}
              onChange={(e: any) => setTitle(e.target.value)}
              placeholder="e.g. Awesome Wireless Headphones"
              id="new-product-title"
            />

            {/* Vendor */}
            <s-text-field
              label="Vendor"
              value={vendor}
              onChange={(e: any) => setVendor(e.target.value)}
              placeholder="e.g. Apple, Samsung…"
              id="new-product-vendor"
            />

            {/* Product Type */}
            <s-text-field
              label="Product Type"
              value={productType}
              onChange={(e: any) => setProductType(e.target.value)}
              placeholder="e.g. Electronics, Apparel…"
              id="new-product-type"
            />

            {/* Tags */}
            <s-text-field
              label="Tags"
              value={tags}
              onChange={(e: any) => setTags(e.target.value)}
              placeholder="Comma-separated: sale, new-arrival, featured"
              id="new-product-tags"
            />

            {/* Status */}
            <s-select
              label="Status"
              value={status}
              onChange={(e: any) => setStatus(e.target.value)}
              id="new-product-status"
            >
              <s-option value="active">🟢 Active</s-option>
              <s-option value="draft">🟡 Draft</s-option>
              <s-option value="archived">🔴 Archived</s-option>
            </s-select>

          </s-stack>
        </s-box>
      </s-section>

      {/* ── Description (rich text) ───────────────────────────────────────── */}
      <s-section heading="Description">
        <s-box padding="large">
          <s-stack gap="base">
            <s-text tone="neutral">
              Use the toolbar below to write and style your product description:
            </s-text>

            {/* ── TOOLBAR ── */}
            <div className="formatting-toolbar">

              {/* Font Family */}
              <div className="toolbar-group">
                <select className="toolbar-select toolbar-select-font" title="Font Family" defaultValue="Arial"
                  onChange={(e) => exec("fontName", e.target.value)}>
                  {FONT_FAMILIES.map((f) => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
                </select>
              </div>

              <span className="toolbar-divider" />

              {/* Font Size */}
              <div className="toolbar-group">
                <select className="toolbar-select toolbar-select-size" title="Font Size" defaultValue="14"
                  onChange={(e) => {
                    exec("fontSize", "7");
                    const el = document.querySelector("font[size='7']") as HTMLElement | null;
                    if (el) { el.removeAttribute("size"); el.style.fontSize = e.target.value + "px"; }
                  }}>
                  {FONT_SIZES.map((s) => <option key={s} value={s}>{s} px</option>)}
                </select>
              </div>

              <span className="toolbar-divider" />

              {/* Heading / Paragraph */}
              <div className="toolbar-group">
                <select className="toolbar-select toolbar-select-heading" title="Paragraph Style" defaultValue="<p>"
                  onChange={(e) => exec("formatBlock", e.target.value)}>
                  {HEADING_OPTIONS.map((o) => <option key={o.val} value={o.val}>{o.label}</option>)}
                </select>
              </div>

              <span className="toolbar-divider" />

              {/* Bold / Italic / Underline / Strike */}
              <div className="toolbar-group">
                <button type="button" className={`toolbar-btn${bold      ? " active" : ""}`} title="Bold"          onClick={() => exec("bold")}><Icon d={ICONS.bold} /></button>
                <button type="button" className={`toolbar-btn${italic    ? " active" : ""}`} title="Italic"        onClick={() => exec("italic")}><Icon d={ICONS.italic} /></button>
                <button type="button" className={`toolbar-btn${underline ? " active" : ""}`} title="Underline"     onClick={() => exec("underline")}><Icon d={ICONS.underline} /></button>
                <button type="button" className={`toolbar-btn${strike    ? " active" : ""}`} title="Strikethrough" onClick={() => exec("strikeThrough")}><Icon d={ICONS.strike} /></button>
              </div>

              <span className="toolbar-divider" />

              {/* Text Color */}
              <div className="toolbar-group">
                <label className="toolbar-color-wrap" title="Text Color">
                  <span className="toolbar-color-bar" style={{ color: textColor }}>A</span>
                  <span className="toolbar-color-swatch" style={{ background: textColor }} />
                  <input type="color" value={textColor} onChange={(e) => { setTextColor(e.target.value); exec("foreColor", e.target.value); }} />
                </label>
              </div>

              <span className="toolbar-divider" />

              {/* Alignment */}
              <div className="toolbar-group">
                <button type="button" className="toolbar-btn" title="Align Left"   onClick={() => exec("justifyLeft")}><Icon d={ICONS.alignLeft} /></button>
                <button type="button" className="toolbar-btn" title="Align Center" onClick={() => exec("justifyCenter")}><Icon d={ICONS.alignCenter} /></button>
                <button type="button" className="toolbar-btn" title="Align Right"  onClick={() => exec("justifyRight")}><Icon d={ICONS.alignRight} /></button>
              </div>

              <span className="toolbar-divider" />

              {/* Lists */}
              <div className="toolbar-group">
                <button type="button" className="toolbar-btn" title="Bullet List"  onClick={() => exec("insertUnorderedList")}><Icon d={ICONS.ul} /></button>
                <button type="button" className="toolbar-btn" title="Numbered List" onClick={() => exec("insertOrderedList")}><Icon d={ICONS.ol} /></button>
              </div>

              <span className="toolbar-divider" />

              {/* Link / Image / Clear */}
              <div className="toolbar-group">
                <button type="button" className="toolbar-btn" title="Insert Link"
                  onClick={() => { const url = prompt("Enter URL (include https://:"); if (url) exec("createLink", url); }}>
                  <Icon d={ICONS.link} />
                </button>
                <label className="toolbar-btn" title="Insert Image" style={{ cursor: "pointer" }}>
                  <Icon d={ICONS.image} />
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={insertImageToEditor} />
                </label>
                <button type="button" className="toolbar-btn" title="Clear Formatting" onClick={() => exec("removeFormat")}>
                  <Icon d={ICONS.clear} />
                  <span style={{ fontSize: 11, marginLeft: 2 }}>Clear</span>
                </button>
              </div>
            </div>

            {/* ── EDITOR AREA ── */}
            <div
              ref={editorRef}
              contentEditable
              className="visual-editor"
              suppressContentEditableWarning
              onInput={handleEditorInput}
              onKeyUp={syncFormats}
              onMouseUp={syncFormats}
              data-placeholder="Write your product description here…"
              id="new-product-description"
            />
          </s-stack>
        </s-box>
      </s-section>

    </s-page>
  );
}
