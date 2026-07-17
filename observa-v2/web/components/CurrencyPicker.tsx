import { useState, useCallback } from "react";
import { Popover, Button, TextField, Icon, BlockStack } from "@shopify/polaris";
import { SearchIcon } from "@shopify/polaris-icons";

interface Currency {
  label: string;
  value: string;
  symbol: string;
}

interface CurrencyPickerProps {
  currencies: Currency[];
  selected: string;
  onChange: (value: string) => void;
}

export function CurrencyPicker({ currencies, selected, onChange }: CurrencyPickerProps) {
  const [popoverActive, setPopoverActive] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const togglePopoverActive = useCallback(
    () => setPopoverActive((active) => !active),
    []
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const handleSelect = useCallback((value: string) => {
    onChange(value);
    setPopoverActive(false);
    setSearchValue("");
  }, [onChange]);

  const filteredCurrencies = currencies.filter((currency) =>
    currency.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  const selectedCurrency = currencies.find((c) => c.value === selected);
  const buttonLabel = selectedCurrency 
    ? `${selectedCurrency.value} ${selectedCurrency.symbol}`
    : "Select currency";

  const activator = (
    <Button onClick={togglePopoverActive} disclosure>
      {buttonLabel}
    </Button>
  );

  return (
    <Popover
      active={popoverActive}
      activator={activator}
      onClose={togglePopoverActive}
      preferredAlignment="left"
    >
      <div style={{ width: "280px" }}>
        <div style={{ padding: "12px", borderBottom: "1px solid var(--p-color-border)" }}>
          <TextField
            label=""
            labelHidden
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Search for a currency"
            prefix={<Icon source={SearchIcon} />}
            autoComplete="off"
          />
        </div>
        <div style={{ maxHeight: "300px", overflowY: "auto", padding: "8px 0" }}>
          {filteredCurrencies.map((currency) => (
            <button
              key={currency.value}
              onClick={() => handleSelect(currency.value)}
              style={{
                width: "100%",
                padding: "8px 16px",
                border: "none",
                background: currency.value === selected ? "var(--p-color-bg-surface-hover)" : "transparent",
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              onMouseEnter={(e) => {
                if (currency.value !== selected) {
                  e.currentTarget.style.background = "var(--p-color-bg-surface-hover)";
                }
              }}
              onMouseLeave={(e) => {
                if (currency.value !== selected) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <span>{currency.label}</span>
              {currency.value === selected && (
                <span style={{ color: "var(--p-color-text-success)", fontSize: "18px" }}>✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </Popover>
  );
}
