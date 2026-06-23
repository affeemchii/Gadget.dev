import { AutoForm, AutoInput, AutoSubmit } from "@gadgetinc/react/auto/polaris-wc";
import { useNavigate } from "react-router";
import { api } from "../api";

export default function NewProduct() {
  const navigate = useNavigate();

  return (
    <s-page heading="Add New Product">

      {/* Back / Cancel button in the page header */}
      <s-button
        slot="secondary-actions"
        id="cancel-new-product-btn"
        onClick={() => navigate("/")}
      >
        ← Back to Products
      </s-button>

      {/* ── Product Form ─────────────────────────────────────────────────── */}
      <s-section heading="Product Details">
        <s-box padding="large">
          {/*
            AutoForm wires up to api.shopifyProduct.create automatically.
            It handles validation, API calls, loading states, and error messages.
            onSuccess navigates back to the products list.
          */}
          {/* @ts-ignore */}
          <AutoForm
            action={api.shopifyProduct.create}
            onSuccess={() => navigate("/")}
            title={false}
          >
            {/* Product title */}
            {/* @ts-ignore */}
            <AutoInput field="title" label="Product Title" />

            {/* Vendor */}
            {/* @ts-ignore */}
            <AutoInput field="vendor" label="Vendor" />

            {/* Product type */}
            {/* @ts-ignore */}
            <AutoInput field="productType" label="Product Type" />

            {/* Tags */}
            {/* @ts-ignore */}
            <AutoInput field="tags" label="Tags (comma-separated)" />

            {/* Status */}
            {/* @ts-ignore */}
            <AutoInput field="status" label="Status" />

            {/* Description / body */}
            {/* @ts-ignore */}
            <AutoInput field="body" label="Description" />

            <div style={{ marginTop: "20px" }}>
              {/* @ts-ignore */}
              <AutoSubmit label="Create Product" />
            </div>
          </AutoForm>
        </s-box>
      </s-section>

    </s-page>
  );
}
