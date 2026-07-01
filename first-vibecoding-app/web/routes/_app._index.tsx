import { AutoTable } from "@gadgetinc/react/auto/polaris-wc";
import { api } from "../api";
import { useState, useRef, useEffect } from "react";

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
  // Action column icons
  // Toggle / status switch
  editStatus: "M17 7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h10c2.76 0 5-2.24 5-5s-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z",
  // Pencil / edit
  editDesc: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
  // Trash / delete
  trash: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
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

// ── Self-contained icon button with tooltip (fixed-position, never clipped) ────
function TooltipBtn({
  label, color, hoverBg, iconPath, onClick,
}: {
  label: string;
  color: string;
  hoverBg: string;
  iconPath: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleEnter = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setCoords({
        top: r.top + window.scrollY - 10,   // 10px above the button
        left: r.left + window.scrollX + r.width / 2,
      });
    }
    setShow(true);
  };

  return (
    <div style={{ position: "relative", display: "inline-flex" }}>
      <button
        ref={btnRef}
        onClick={onClick}
        onMouseEnter={handleEnter}
        onMouseLeave={() => setShow(false)}
        style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: "30px", height: "30px", padding: 0, border: "none",
          borderRadius: "6px",
          background: show ? hoverBg : "transparent",
          cursor: "pointer", color,
          transition: "background 0.15s",
          flexShrink: 0,
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d={iconPath} />
        </svg>
      </button>

      {/* Tooltip rendered in fixed-position so it's never clipped */}
      {show && (
        <div style={{
          position: "fixed",
          top: coords.top,
          left: coords.left,
          transform: "translate(-50%, -100%)",
          background: "#1a1a1a",
          color: "#fff",
          fontSize: "12px",
          fontWeight: 500,
          fontFamily: "system-ui, -apple-system, sans-serif",
          lineHeight: 1.3,
          padding: "5px 10px",
          borderRadius: "6px",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          zIndex: 99999,
          boxShadow: "0 3px 10px rgba(0,0,0,0.30)",
        }}>
          {label}
          <div style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 0, height: 0,
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderTop: "5px solid #1a1a1a",
          }} />
        </div>
      )}
    </div>
  );
}

export default function Index() {
  // ── edit-existing state ───────────────────────────────────────────────────
  const [editingProduct, setEditingProduct] = useState<EditingProduct | null>(null);
  const [status, setStatus] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  // ── edit-status state ──────────────────────────────────────────────────────
  const [statusProduct, setStatusProduct] = useState<{ id: string; title: string; status: string } | null>(null);
  const [editingStatus, setEditingStatus] = useState("");
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusSaved, setStatusSaved] = useState(false);
  const editStatusModalRef = useRef<HTMLElement>(null);

  // ── add-product state (Shopify-styled) ─────────────────────────────────────
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newVendor, setNewVendor] = useState("");
  const [newProductType, setNewProductType] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newStatus, setNewStatus] = useState("draft");
  const [newTags, setNewTags] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCompareAtPrice, setNewCompareAtPrice] = useState("");
  const [newChargeTax, setNewChargeTax] = useState(true);
  const [newCostPerItem, setNewCostPerItem] = useState("");
  const [newSku, setNewSku] = useState("");
  const [newBarcode, setNewBarcode] = useState("");
  const [newTrackQuantity, setNewTrackQuantity] = useState(true);
  const [newQuantity, setNewQuantity] = useState("");
  const [newPhysicalProduct, setNewPhysicalProduct] = useState(true);
  const [newWeight, setNewWeight] = useState("");
  const [newWeightUnit, setNewWeightUnit] = useState("lb");
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
  const deleteConfirmModalRef = useRef<HTMLElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── bulk selection state ──────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // ── bulk edit-status state ────────────────────────────────────────────────
  const [bulkStatus, setBulkStatus] = useState("draft");
  const [bulkStatusSaving, setBulkStatusSaving] = useState(false);
  const [bulkStatusError, setBulkStatusError] = useState<string | null>(null);
  const [bulkStatusSaved, setBulkStatusSaved] = useState(false);
  const bulkStatusModalRef = useRef<HTMLElement>(null);

  // ── bulk delete state ─────────────────────────────────────────────────────
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState<string | null>(null);
  const bulkDeleteModalRef = useRef<HTMLElement>(null);

  // ── bulk action helpers ───────────────────────────────────────────────────
  const openBulkStatus = () => {
    setBulkStatus("draft");
    setBulkStatusError(null);
    setBulkStatusSaved(false);
    setTimeout(() => (bulkStatusModalRef.current as any)?.showOverlay?.(), 30);
  };

  const closeBulkStatus = () => {
    setBulkStatusError(null);
    setBulkStatusSaved(false);
    (bulkStatusModalRef.current as any)?.hideOverlay?.();
  };

  const handleBulkSaveStatus = async () => {
    setBulkStatusSaving(true);
    setBulkStatusError(null);
    try {
      await Promise.all(
        selectedIds.map((id) => api.shopifyProduct.update(id, { status: bulkStatus }))
      );
      setBulkStatusSaved(true);
      setTimeout(() => {
        closeBulkStatus();
        setSelectedIds([]);
      }, 1200);
    } catch (err: any) {
      setBulkStatusError(err?.message ?? "Failed to update status for selected products.");
    } finally {
      setBulkStatusSaving(false);
    }
  };

  const openBulkDelete = () => {
    setBulkDeleteError(null);
    setTimeout(() => (bulkDeleteModalRef.current as any)?.showOverlay?.(), 30);
  };

  const closeBulkDelete = () => {
    setBulkDeleteError(null);
    (bulkDeleteModalRef.current as any)?.hideOverlay?.();
  };

  const handleBulkDelete = async () => {
    setBulkDeleting(true);
    setBulkDeleteError(null);
    try {
      await Promise.all(
        selectedIds.map((id) => (api.shopifyProduct as any).delete(id))
      );
      closeBulkDelete();
      setSelectedIds([]);
    } catch (err: any) {
      setBulkDeleteError(err?.message ?? "Failed to delete selected products.");
    } finally {
      setBulkDeleting(false);
    }
  };

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
      (editModalRef.current as any)?.showOverlay?.();
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
    setNewCategory("");
    setNewStatus("draft");
    setNewTags("");
    setNewBody("");
    setNewPrice("");
    setNewCompareAtPrice("");
    setNewChargeTax(true);
    setNewCostPerItem("");
    setNewSku("");
    setNewBarcode("");
    setNewTrackQuantity(true);
    setNewQuantity("");
    setNewPhysicalProduct(true);
    setNewWeight("");
    setNewWeightUnit("lb");
    setNewSaveError(null);
    setNewSaved(false);
    setShowAddForm(true);
    setTimeout(() => {
      if (newEditorRef.current) newEditorRef.current.innerHTML = "";
    }, 60);
  };

  const closeAddForm = () => {
    setShowAddForm(false);
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

  // ── open edit-status modal ────────────────────────────────────────────────
  const openEditStatus = (record: any) => {
    setStatusProduct({ id: record.id, title: record.title ?? "Untitled Product", status: record.status ?? "active" });
    setEditingStatus(record.status ?? "active");
    setStatusError(null);
    setStatusSaved(false);
    setTimeout(() => (editStatusModalRef.current as any)?.showOverlay?.(), 30);
  };

  const closeEditStatus = () => {
    setStatusProduct(null);
    setStatusError(null);
    setStatusSaved(false);
    (editStatusModalRef.current as any)?.hideOverlay?.();
  };

  const handleSaveStatus = async () => {
    if (!statusProduct) return;
    setStatusSaving(true);
    setStatusError(null);
    try {
      await api.shopifyProduct.update(statusProduct.id, { status: editingStatus });
      setStatusSaved(true);
      setTimeout(() => closeEditStatus(), 1200);
    } catch (err: any) {
      setStatusError(err?.message ?? "Failed to update status.");
    } finally {
      setStatusSaving(false);
    }
  };

  // ── delete product (modal-based) ───────────────────────────────────────────
  const openDeleteConfirm = (record: any) => {
    setDeleteTarget({ id: record.id, title: record.title ?? "this product" });
    setDeleteError(null);
    setTimeout(() => (deleteConfirmModalRef.current as any)?.showOverlay?.(), 30);
  };

  const closeDeleteConfirm = () => {
    setDeleteTarget(null);
    setDeleteError(null);
    (deleteConfirmModalRef.current as any)?.hideOverlay?.();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await (api.shopifyProduct as any).delete(deleteTarget.id);
      closeDeleteConfirm();
    } catch (err: any) {
      setDeleteError(err?.message ?? "Failed to delete product. Please try again.");
    } finally {
      setDeleting(false);
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
      const productPayload: any = {
        title: newTitle.trim(),
        vendor: newVendor.trim() || undefined,
        productType: newProductType.trim() || undefined,
        status: newStatus,
        tags: newTags.trim() || undefined,
        body: newBody || undefined,
        category: newCategory.trim() || undefined,
      };

      // Construct default variant details if price/inventory/sku is provided
      if (newPrice || newCompareAtPrice || newSku || newBarcode || newQuantity || newWeight) {
        productPayload.variants = [
          {
            price: newPrice.trim() || "0.00",
            compareAtPrice: newCompareAtPrice.trim() || undefined,
            sku: newSku.trim() || undefined,
            barcode: newBarcode.trim() || undefined,
            taxable: newChargeTax,
            cost: newCostPerItem.trim() || undefined,
            requiresShipping: newPhysicalProduct,
            weight: newWeight ? parseFloat(newWeight) : undefined,
            weightUnit: newWeightUnit,
            inventoryManagement: newTrackQuantity ? "shopify" : "none",
            inventoryQuantity: newQuantity ? parseInt(newQuantity) : undefined,
          }
        ];
      }

      await (api.shopifyProduct as any).create(productPayload);
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

  if (showAddForm) {
    return (
      <div className="shopify-add-product-page">
        {/* Sticky Header */}
        <div className="shopify-page-header">
          <div className="shopify-header-left">
            <button className="shopify-back-btn" onClick={closeAddForm} title="Back to products">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="18" height="18" fill="currentColor">
                <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
              </svg>
            </button>
            <h1 className="shopify-page-title">Add product</h1>
          </div>
          <div className="shopify-header-actions">
            <button className="shopify-btn-discard" onClick={closeAddForm} disabled={newSaving}>
              Discard
            </button>
            <button className="shopify-btn-save" onClick={handleCreate} disabled={newSaving}>
              {newSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        {/* Form Body Grid */}
        <div className="shopify-grid">
          {/* Main Column */}
          <div>
            {/* Success Banner */}
            {newSaved && (
              <div style={{ marginBottom: "20px" }}>
                <s-banner tone="success">
                  <s-text>✅ Product created successfully!</s-text>
                </s-banner>
              </div>
            )}

            {/* Error Banner */}
            {newSaveError && (
              <div style={{ marginBottom: "20px" }}>
                <s-banner tone="critical">
                  <s-text>{newSaveError}</s-text>
                </s-banner>
              </div>
            )}

            {/* Title & Description Card */}
            <div className="shopify-card">
              <div className="shopify-field">
                <label className="shopify-label">Title</label>
                <input
                  type="text"
                  className="shopify-input"
                  placeholder="Short sleeve t-shirt"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  disabled={newSaving}
                />
              </div>

              <div className="shopify-field">
                <label className="shopify-label" style={{ marginBottom: "8px" }}>Description</label>
                
                {/* Formatting toolbar */}
                <div className="formatting-toolbar">
                  <div className="toolbar-group">
                    <select className="toolbar-select toolbar-select-font" title="Font Family" defaultValue="Arial"
                      onChange={(e) => execNew("fontName", e.target.value)} disabled={newSaving}>
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
                      }} disabled={newSaving}>
                      {FONT_SIZES.map((s) => <option key={s} value={s}>{s} px</option>)}
                    </select>
                  </div>

                  <span className="toolbar-divider" />

                  <div className="toolbar-group">
                    <select className="toolbar-select toolbar-select-heading" title="Paragraph Style" defaultValue="<p>"
                      onChange={(e) => execNew("formatBlock", e.target.value)} disabled={newSaving}>
                      {HEADING_OPTIONS.map((o) => <option key={o.val} value={o.val}>{o.label}</option>)}
                    </select>
                  </div>

                  <span className="toolbar-divider" />

                  <div className="toolbar-group">
                    <button type="button" className={`toolbar-btn${newBold ? " active" : ""}`} title="Bold" onClick={() => execNew("bold")} disabled={newSaving}><Icon d={ICONS.bold} /></button>
                    <button type="button" className={`toolbar-btn${newItalic ? " active" : ""}`} title="Italic" onClick={() => execNew("italic")} disabled={newSaving}><Icon d={ICONS.italic} /></button>
                    <button type="button" className={`toolbar-btn${newUnderline ? " active" : ""}`} title="Underline" onClick={() => execNew("underline")} disabled={newSaving}><Icon d={ICONS.underline} /></button>
                    <button type="button" className={`toolbar-btn${newStrike ? " active" : ""}`} title="Strikethrough" onClick={() => execNew("strikeThrough")} disabled={newSaving}><Icon d={ICONS.strike} /></button>
                  </div>

                  <span className="toolbar-divider" />

                  <div className="toolbar-group">
                    <label className="toolbar-color-wrap" title="Text Color">
                      <span className="toolbar-color-bar" style={{ color: newTextColor }}>A</span>
                      <span className="toolbar-color-swatch" style={{ background: newTextColor }} />
                      <input type="color" value={newTextColor} onChange={(e) => { setNewTextColor(e.target.value); execNew("foreColor", e.target.value); }} disabled={newSaving} />
                    </label>
                  </div>

                  <span className="toolbar-divider" />

                  <div className="toolbar-group">
                    <button type="button" className="toolbar-btn" title="Align Left" onClick={() => execNew("justifyLeft")} disabled={newSaving}><Icon d={ICONS.alignLeft} /></button>
                    <button type="button" className="toolbar-btn" title="Align Center" onClick={() => execNew("justifyCenter")} disabled={newSaving}><Icon d={ICONS.alignCenter} /></button>
                    <button type="button" className="toolbar-btn" title="Align Right" onClick={() => execNew("justifyRight")} disabled={newSaving}><Icon d={ICONS.alignRight} /></button>
                    <button type="button" className="toolbar-btn" title="Justify" onClick={() => execNew("justifyFull")} disabled={newSaving}><Icon d={ICONS.justify} /></button>
                  </div>

                  <span className="toolbar-divider" />

                  <div className="toolbar-group">
                    <button type="button" className="toolbar-btn" title="Bullet List" onClick={() => execNew("insertUnorderedList")} disabled={newSaving}><Icon d={ICONS.ul} /></button>
                    <button type="button" className="toolbar-btn" title="Numbered List" onClick={() => execNew("insertOrderedList")} disabled={newSaving}><Icon d={ICONS.ol} /></button>
                    <button type="button" className="toolbar-btn" title="Decrease Indent" onClick={() => execNew("outdent")} disabled={newSaving}><Icon d={ICONS.outdent} /></button>
                    <button type="button" className="toolbar-btn" title="Increase Indent" onClick={() => execNew("indent")} disabled={newSaving}><Icon d={ICONS.indent} /></button>
                  </div>

                  <span className="toolbar-divider" />

                  <div className="toolbar-group">
                    <button type="button" className="toolbar-btn" title="Blockquote" onClick={() => execNew("formatBlock", "<blockquote>")} disabled={newSaving}><Icon d={ICONS.quote} /></button>
                    <button type="button" className="toolbar-btn" title="Insert Link"
                      onClick={() => { const url = prompt("Enter URL (include https://):"); if (url) execNew("createLink", url); }} disabled={newSaving}>
                      <Icon d={ICONS.link} />
                    </button>
                    <label className="toolbar-btn" title="Insert Image" style={{ cursor: "pointer" }}>
                      <Icon d={ICONS.image} />
                      <input type="file" accept="image/*" style={{ display: "none" }} onChange={insertImageToNewEditor} disabled={newSaving} />
                    </label>
                  </div>

                  <span className="toolbar-divider" />

                  <div className="toolbar-group">
                    <button type="button" className="toolbar-btn" title="Clear Formatting" onClick={() => execNew("removeFormat")} disabled={newSaving}>
                      <Icon d={ICONS.clear} />
                      <span style={{ fontSize: 11, marginLeft: 2 }}>Clear</span>
                    </button>
                  </div>
                </div>

                <div
                  ref={newEditorRef}
                  contentEditable
                  className="visual-editor"
                  suppressContentEditableWarning
                  onInput={handleNewEditorInput}
                  onKeyUp={syncNewFormats}
                  onMouseUp={syncNewFormats}
                  data-placeholder="Write your product description here…"
                  style={{ minHeight: "180px", border: "1px solid #c9cdd3", borderTop: "none" }}
                />
              </div>
            </div>

            {/* Media Card */}
            <div className="shopify-card">
              <h3 className="shopify-card-title">Media</h3>
              <label className="shopify-media-upload">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="32" height="32" fill="#5c5f62">
                  <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0v-5.5A.75.75 0 0 1 10 3ZM5.75 8a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0v-5.5A.75.75 0 0 1 5.75 8ZM14.25 8a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0v-5.5a.75.75 0 0 1 .75-.75ZM2 10a8 8 0 1 1 16 0 8 8 0 0 1-16 0Zm8-6.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Z" clipRule="evenodd" />
                </svg>
                <p className="shopify-media-upload-title">Upload new files</p>
                <p className="shopify-media-upload-sub">Accepts images, videos, or 3D models</p>
                <input type="file" accept="image/*" style={{ display: "none" }} disabled={newSaving} />
              </label>
            </div>

            {/* Pricing Card */}
            <div className="shopify-card">
              <h3 className="shopify-card-title">Pricing</h3>
              <div className="shopify-input-group">
                <div className="shopify-field">
                  <label className="shopify-label">Price</label>
                  <input
                    type="text"
                    className="shopify-input"
                    placeholder="Rs 0.00"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    disabled={newSaving}
                  />
                </div>
                <div className="shopify-field">
                  <label className="shopify-label">Compare at price</label>
                  <input
                    type="text"
                    className="shopify-input"
                    placeholder="Rs 0.00"
                    value={newCompareAtPrice}
                    onChange={(e) => setNewCompareAtPrice(e.target.value)}
                    disabled={newSaving}
                  />
                </div>
              </div>

              <label className="shopify-checkbox-label">
                <input
                  type="checkbox"
                  className="shopify-checkbox"
                  checked={newChargeTax}
                  onChange={(e) => setNewChargeTax(e.target.checked)}
                  disabled={newSaving}
                />
                Charge tax on this product
              </label>

              <div className="shopify-field" style={{ maxWidth: "50%", marginTop: "16px" }}>
                <label className="shopify-label">Cost per item</label>
                <input
                  type="text"
                  className="shopify-input"
                  placeholder="Rs 0.00"
                  value={newCostPerItem}
                  onChange={(e) => setNewCostPerItem(e.target.value)}
                  disabled={newSaving}
                />
              </div>
            </div>

            {/* Inventory Card */}
            <div className="shopify-card">
              <h3 className="shopify-card-title">Inventory</h3>
              
              <label className="shopify-checkbox-label" style={{ marginBottom: "16px" }}>
                <input
                  type="checkbox"
                  className="shopify-checkbox"
                  checked={newTrackQuantity}
                  onChange={(e) => setNewTrackQuantity(e.target.checked)}
                  disabled={newSaving}
                />
                Track quantity
              </label>

              <div className="shopify-input-group">
                <div className="shopify-field">
                  <label className="shopify-label">SKU (Stock Keeping Unit)</label>
                  <input
                    type="text"
                    className="shopify-input"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    disabled={newSaving}
                  />
                </div>
                <div className="shopify-field">
                  <label className="shopify-label">Barcode (ISBN, UPC, GTIN, etc.)</label>
                  <input
                    type="text"
                    className="shopify-input"
                    value={newBarcode}
                    onChange={(e) => setNewBarcode(e.target.value)}
                    disabled={newSaving}
                  />
                </div>
              </div>

              {newTrackQuantity && (
                <div className="shopify-field" style={{ maxWidth: "50%", marginTop: "12px" }}>
                  <label className="shopify-label">Available quantity</label>
                  <input
                    type="number"
                    className="shopify-input"
                    placeholder="0"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    disabled={newSaving}
                  />
                </div>
              )}
            </div>

            {/* Shipping Card */}
            <div className="shopify-card">
              <h3 className="shopify-card-title">Shipping</h3>
              <label className="shopify-checkbox-label" style={{ marginBottom: "16px" }}>
                <input
                  type="checkbox"
                  className="shopify-checkbox"
                  checked={newPhysicalProduct}
                  onChange={(e) => setNewPhysicalProduct(e.target.checked)}
                  disabled={newSaving}
                />
                This is a physical product
              </label>

              {newPhysicalProduct && (
                <div className="shopify-input-group" style={{ gridTemplateColumns: "2fr 1fr", marginTop: "12px" }}>
                  <div className="shopify-field">
                    <label className="shopify-label">Weight</label>
                    <input
                      type="text"
                      className="shopify-input"
                      placeholder="0.0"
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                      disabled={newSaving}
                    />
                  </div>
                  <div className="shopify-field">
                    <label className="shopify-label">Unit</label>
                    <select
                      className="shopify-input"
                      style={{ padding: "8px 6px" }}
                      value={newWeightUnit}
                      onChange={(e) => setNewWeightUnit(e.target.value)}
                      disabled={newSaving}
                    >
                      <option value="lb">lb</option>
                      <option value="oz">oz</option>
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Column */}
          <div>
            {/* Status Card */}
            <div className="shopify-card">
              <h3 className="shopify-card-title">Product status</h3>
              <div className="shopify-field" style={{ marginBottom: 0 }}>
                <select
                  className="shopify-input"
                  style={{ padding: "8px 6px", fontWeight: "500" }}
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  disabled={newSaving}
                >
                  <option value="active">🟢 Active</option>
                  <option value="draft">🟡 Draft</option>
                  <option value="archived">🔴 Archived</option>
                </select>
              </div>
            </div>

            {/* Product Organization Card */}
            <div className="shopify-card">
              <h3 className="shopify-card-title">Product organization</h3>
              
              <div className="shopify-field">
                <label className="shopify-label">Category</label>
                <input
                  type="text"
                  className="shopify-input"
                  placeholder="e.g. Apparel"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  disabled={newSaving}
                />
              </div>

              <div className="shopify-field">
                <label className="shopify-label">Product type</label>
                <input
                  type="text"
                  className="shopify-input"
                  placeholder="e.g. T-shirt"
                  value={newProductType}
                  onChange={(e) => setNewProductType(e.target.value)}
                  disabled={newSaving}
                />
              </div>

              <div className="shopify-field">
                <label className="shopify-label">Vendor</label>
                <input
                  type="text"
                  className="shopify-input"
                  placeholder="e.g. Nike"
                  value={newVendor}
                  onChange={(e) => setNewVendor(e.target.value)}
                  disabled={newSaving}
                />
              </div>

              <div className="shopify-field" style={{ marginBottom: 0 }}>
                <label className="shopify-label">Tags</label>
                <input
                  type="text"
                  className="shopify-input"
                  placeholder="Comma-separated: Summer, Sale, New"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  disabled={newSaving}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions bar */}
        <div className="shopify-footer-bar">
          <button className="shopify-btn-discard" onClick={closeAddForm} disabled={newSaving}>
            Discard
          </button>
          <button className="shopify-btn-save" onClick={handleCreate} disabled={newSaving}>
            {newSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    );
  }

  return (
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
        {selectedIds.length > 0 && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 20px",
            background: "#f1f5f9",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            marginBottom: "16px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>
                {selectedIds.length} {selectedIds.length === 1 ? "product" : "products"} selected
              </span>
              <button
                onClick={() => {
                  setSelectedIds([]);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#2563eb",
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "500",
                }}
              >
                Clear selection
              </button>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                id="bulk-status-btn"
                onClick={openBulkStatus}
                style={{
                  padding: "6px 12px",
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
              >
                Change Status
              </button>
              <button
                id="bulk-delete-btn"
                onClick={openBulkDelete}
                style={{
                  padding: "6px 12px",
                  background: "#bf0711",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}

        <div>
          <AutoTable
            //@ts-ignore
            model={api.shopifyProduct}
            selectable={false}
            columns={[
              {
                header: "Select",
                render: ({ record }: { record: any }) => (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(record.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds((prev) => [...prev, record.id]);
                        } else {
                          setSelectedIds((prev) => prev.filter((id) => id !== record.id));
                        }
                      }}
                      style={{
                        cursor: "pointer",
                        width: "16px",
                        height: "16px",
                        borderRadius: "4px",
                        accentColor: "#008060",
                      }}
                    />
                  </div>
                ),
              },
              "title",
              "status",
              "vendor",
              "productType",
              "publishedAt",
              {
                header: "Actions",
                render: ({ record }: { record: any }) => (
                  <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0px",
                    background: "#ffffff",
                    border: "1px solid #e1e3e5",
                    borderRadius: "8px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                    padding: "2px",
                    overflow: "visible",
                    position: "relative",
                  }}>
                    <TooltipBtn
                      label="Edit Status"
                      color="#2563eb"
                      hoverBg="#dbeafe"
                      iconPath={ICONS.editStatus}
                      onClick={(e) => { e.stopPropagation(); openEditStatus(record); }}
                    />

                    <span style={{ width: "1px", height: "18px", background: "#e1e3e5", flexShrink: 0 }} />

                    <TooltipBtn
                      label="Edit Description"
                      color="#008060"
                      hoverBg="#d1fae5"
                      iconPath={ICONS.editDesc}
                      onClick={(e) => { e.stopPropagation(); openEdit(record); }}
                    />

                    <span style={{ width: "1px", height: "18px", background: "#e1e3e5", flexShrink: 0 }} />

                    <TooltipBtn
                      label="Delete Product"
                      color="#bf0711"
                      hoverBg="#fee2e2"
                      iconPath={ICONS.trash}
                      onClick={(e) => { e.stopPropagation(); openDeleteConfirm(record); }}
                    />
                  </div>
                ),
              },
            ]}
          />
        </div>
      </s-section>



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

      {/* ── Edit Status Modal ───────────────────────────────────────────────── */}
      <s-modal
        ref={editStatusModalRef as any}
        id="edit-status-modal"
        heading={statusProduct ? `Edit Status — ${statusProduct.title}` : "Edit Status"}
        onHide={closeEditStatus}
      >
        {statusProduct && (
          <s-box padding="large">
            <s-stack gap="large">
              {statusSaved && (
                <s-banner tone="success">
                  <s-text>✅ Status updated successfully!</s-text>
                </s-banner>
              )}
              {statusError && (
                <s-banner tone="critical">
                  <s-text>{statusError}</s-text>
                </s-banner>
              )}
              <s-select
                label="Product Status"
                value={editingStatus}
                onChange={(e: any) => setEditingStatus(e.target.value)}
                id="edit-status-select"
              >
                <s-option value="active">🟢 Active</s-option>
                <s-option value="draft">🟡 Draft</s-option>
                <s-option value="archived">🔴 Archived</s-option>
              </s-select>
            </s-stack>
          </s-box>
        )}
        <div slot="primaryAction">
          <s-button
            id="save-status-btn"
            variant="primary"
            loading={statusSaving}
            onClick={handleSaveStatus}
          >
            {statusSaved ? "✅ Saved!" : "Save Status"}
          </s-button>
        </div>
        <div slot="secondaryActions">
          <s-button id="cancel-status-btn" onClick={closeEditStatus}>Cancel</s-button>
        </div>
      </s-modal>

      {/* ── Delete Confirm Modal ────────────────────────────────────────────── */}
      <s-modal
        ref={deleteConfirmModalRef as any}
        id="delete-confirm-modal"
        heading="Delete Product"
        onHide={closeDeleteConfirm}
      >
        {deleteTarget && (
          <s-box padding="large">
            <s-stack gap="base">
              {deleteError && (
                <s-banner tone="critical">
                  <s-text>{deleteError}</s-text>
                </s-banner>
              )}
              <s-text>
                Are you sure you want to delete <strong>{deleteTarget.title}</strong>? This action cannot be undone.
              </s-text>
            </s-stack>
          </s-box>
        )}
        <div slot="primaryAction">
          <s-button
            id="confirm-delete-btn"
            tone="critical"
            loading={deleting}
            onClick={handleDelete}
          >
            Delete Product
          </s-button>
        </div>
        <div slot="secondaryActions">
          <s-button id="cancel-delete-btn" onClick={closeDeleteConfirm}>Cancel</s-button>
        </div>
      </s-modal>

      {/* ── Bulk Edit Status Modal ───────────────────────────────────────────── */}
      <s-modal
        ref={bulkStatusModalRef as any}
        id="bulk-status-modal"
        heading={`Edit Status for ${selectedIds.length} Products`}
        onHide={closeBulkStatus}
      >
        <s-box padding="large">
          <s-stack gap="large">
            {bulkStatusSaved && (
              <s-banner tone="success">
                <s-text>✅ Status updated successfully for all selected products!</s-text>
              </s-banner>
            )}
            {bulkStatusError && (
              <s-banner tone="critical">
                <s-text>{bulkStatusError}</s-text>
              </s-banner>
            )}
            <s-select
              label="New Status"
              value={bulkStatus}
              onChange={(e: any) => setBulkStatus(e.target.value)}
              id="bulk-status-select"
            >
              <s-option value="active">🟢 Active</s-option>
              <s-option value="draft">🟡 Draft</s-option>
              <s-option value="archived">🔴 Archived</s-option>
            </s-select>
          </s-stack>
        </s-box>
        <div slot="primaryAction">
          <s-button
            id="bulk-save-status-btn"
            variant="primary"
            loading={bulkStatusSaving}
            onClick={handleBulkSaveStatus}
          >
            {bulkStatusSaved ? "✅ Saved!" : "Save Status"}
          </s-button>
        </div>
        <div slot="secondaryActions">
          <s-button id="bulk-cancel-status-btn" onClick={closeBulkStatus}>Cancel</s-button>
        </div>
      </s-modal>

      {/* ── Bulk Delete Confirm Modal ────────────────────────────────────────── */}
      <s-modal
        ref={bulkDeleteModalRef as any}
        id="bulk-delete-confirm-modal"
        heading="Delete Products"
        onHide={closeBulkDelete}
      >
        <s-box padding="large">
          <s-stack gap="base">
            {bulkDeleteError && (
              <s-banner tone="critical">
                <s-text>{bulkDeleteError}</s-text>
              </s-banner>
            )}
            <s-text>
              Are you sure you want to delete <strong>{selectedIds.length}</strong> selected products? This action cannot be undone.
            </s-text>
          </s-stack>
        </s-box>
        <div slot="primaryAction">
          <s-button
            id="bulk-confirm-delete-btn"
            tone="critical"
            loading={bulkDeleting}
            onClick={handleBulkDelete}
          >
            Delete Products
          </s-button>
        </div>
        <div slot="secondaryActions">
          <s-button id="bulk-cancel-delete-btn" onClick={closeBulkDelete}>Cancel</s-button>
        </div>
      </s-modal>
    </s-page>
  );
}
