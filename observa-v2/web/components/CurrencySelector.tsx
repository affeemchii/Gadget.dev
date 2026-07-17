import React, { useState, useCallback } from 'react';
import {
  Icon,
  Popover,
  Button,
  TextField,
  Listbox,
  AutoSelection,
  Scrollable,
  EmptySearchResult,
  BlockStack,
} from '@shopify/polaris';
import { SearchIcon, CurrencyConvertIcon } from '@shopify/polaris-icons';

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

// Comprehensive currency list with symbols
const currencies: Currency[] = [
  { code: "USD", name: "United States Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "AUD", name: "Australian Dollar", symbol: "$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "$" },
  { code: "CHF", name: "Swiss Franc", symbol: "Fr" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "SAR", name: "Saudi Riyal", symbol: "ر.س" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "MXN", name: "Mexican Peso", symbol: "$" },
  { code: "SGD", name: "Singapore Dollar", symbol: "$" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "$" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "$" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr" },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr" },
  { code: "DKK", name: "Danish Krone", symbol: "kr" },
  { code: "PLN", name: "Polish Złoty", symbol: "zł" },
  { code: "THB", name: "Thai Baht", symbol: "฿" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
  { code: "PHP", name: "Philippine Peso", symbol: "₱" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺" },
  { code: "RUB", name: "Russian Ruble", symbol: "₽" },
  { code: "ILS", name: "Israeli New Shekel", symbol: "₪" },
  { code: "EGP", name: "Egyptian Pound", symbol: "£" },
  { code: "ARS", name: "Argentine Peso", symbol: "$" },
  { code: "CLP", name: "Chilean Peso", symbol: "$" },
  { code: "COP", name: "Colombian Peso", symbol: "$" },
  { code: "PEN", name: "Peruvian Sol", symbol: "S/." },
  { code: "VND", name: "Vietnamese Đồng", symbol: "₫" },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳" },
  { code: "KES", name: "Kenyan Shilling", symbol: "Sh" },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "₵" },
  { code: "TZS", name: "Tanzanian Shilling", symbol: "Sh" },
  { code: "UGX", name: "Ugandan Shilling", symbol: "Sh" },
  { code: "MAD", name: "Moroccan Dirham", symbol: "د.م." },
  { code: "DZD", name: "Algerian Dinar", symbol: "د.ج" },
  { code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs" },
  { code: "NPR", name: "Nepalese Rupee", symbol: "₨" },
  { code: "AFN", name: "Afghan Afghani", symbol: "؋" },
  { code: "MMK", name: "Myanmar Kyat", symbol: "K" },
  { code: "KHR", name: "Cambodian Riel", symbol: "៛" },
  { code: "LAK", name: "Lao Kip", symbol: "₭" },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč" },
  { code: "HUF", name: "Hungarian Forint", symbol: "Ft" },
  { code: "RON", name: "Romanian Leu", symbol: "lei" },
  { code: "BGN", name: "Bulgarian Lev", symbol: "лв" },
  { code: "HRK", name: "Croatian Kuna", symbol: "kn" },
  { code: "UAH", name: "Ukrainian Hryvnia", symbol: "₴" },
  { code: "KZT", name: "Kazakhstani Tenge", symbol: "₸" },
  { code: "GEL", name: "Georgian Lari", symbol: "₾" },
  { code: "AMD", name: "Armenian Dram", symbol: "֏" },
  { code: "AZN", name: "Azerbaijani Manat", symbol: "₼" },
  { code: "UZS", name: "Uzbekistani Som", symbol: "so'm" },
  { code: "QAR", name: "Qatari Riyal", symbol: "ر.ق" },
  { code: "KWD", name: "Kuwaiti Dinar", symbol: "د.ك" },
  { code: "BHD", name: "Bahraini Dinar", symbol: ".د.ب" },
  { code: "OMR", name: "Omani Rial", symbol: "ر.ع." },
  { code: "JOD", name: "Jordanian Dinar", symbol: "د.ا" },
  { code: "LBP", name: "Lebanese Pound", symbol: "ل.ل" },
  { code: "IQD", name: "Iraqi Dinar", symbol: "ع.د" },
  { code: "IRR", name: "Iranian Rial", symbol: "﷼" },
  { code: "ISK", name: "Icelandic Króna", symbol: "kr" },
  { code: "ALL", name: "Albanian Lek", symbol: "L" },
  { code: "BAM", name: "Bosnia-Herzegovina Mark", symbol: "KM" },
  { code: "MKD", name: "Macedonian Denar", symbol: "ден" },
  { code: "RSD", name: "Serbian Dinar", symbol: "дин" },
  { code: "TND", name: "Tunisian Dinar", symbol: "د.ت" },
  { code: "LYD", name: "Libyan Dinar", symbol: "ل.د" },
  { code: "SDG", name: "Sudanese Pound", symbol: "ج.س." },
  { code: "ETB", name: "Ethiopian Birr", symbol: "Br" },
  { code: "MWK", name: "Malawian Kwacha", symbol: "MK" },
  { code: "ZMW", name: "Zambian Kwacha", symbol: "ZK" },
  { code: "BWP", name: "Botswanan Pula", symbol: "P" },
  { code: "NAD", name: "Namibian Dollar", symbol: "$" },
  { code: "SZL", name: "Swazi Lilangeni", symbol: "L" },
  { code: "LSL", name: "Lesotho Loti", symbol: "L" },
  { code: "MGA", name: "Malagasy Ariary", symbol: "Ar" },
  { code: "MUR", name: "Mauritian Rupee", symbol: "₨" },
  { code: "SCR", name: "Seychellois Rupee", symbol: "₨" },
  { code: "MZN", name: "Mozambican Metical", symbol: "MT" },
  { code: "AOA", name: "Angolan Kwanza", symbol: "Kz" },
  { code: "ZWL", name: "Zimbabwean Dollar", symbol: "$" },
  { code: "BBD", name: "Barbadian Dollar", symbol: "$" },
  { code: "BMD", name: "Bermudian Dollar", symbol: "$" },
  { code: "BND", name: "Brunei Dollar", symbol: "$" },
  { code: "BSD", name: "Bahamian Dollar", symbol: "$" },
  { code: "BZD", name: "Belize Dollar", symbol: "$" },
  { code: "CUP", name: "Cuban Peso", symbol: "$" },
  { code: "CVE", name: "Cape Verdean Escudo", symbol: "$" },
  { code: "DOP", name: "Dominican Peso", symbol: "$" },
  { code: "FJD", name: "Fijian Dollar", symbol: "$" },
  { code: "GTQ", name: "Guatemalan Quetzal", symbol: "Q" },
  { code: "GYD", name: "Guyanese Dollar", symbol: "$" },
  { code: "HNL", name: "Honduran Lempira", symbol: "L" },
  { code: "HTG", name: "Haitian Gourde", symbol: "G" },
  { code: "JMD", name: "Jamaican Dollar", symbol: "$" },
  { code: "KYD", name: "Cayman Islands Dollar", symbol: "$" },
  { code: "MDL", name: "Moldovan Leu", symbol: "L" },
  { code: "NIO", name: "Nicaraguan Córdoba", symbol: "C$" },
  { code: "PAB", name: "Panamanian Balboa", symbol: "B/." },
  { code: "PGK", name: "Papua New Guinean Kina", symbol: "K" },
  { code: "PYG", name: "Paraguayan Guaraní", symbol: "₲" },
  { code: "SBD", name: "Solomon Islands Dollar", symbol: "$" },
  { code: "SHP", name: "Saint Helena Pound", symbol: "£" },
  { code: "SLL", name: "Sierra Leonean Leone", symbol: "Le" },
  { code: "SOS", name: "Somali Shilling", symbol: "Sh" },
  { code: "SRD", name: "Surinamese Dollar", symbol: "$" },
  { code: "SSP", name: "South Sudanese Pound", symbol: "£" },
  { code: "STN", name: "São Tomé Dobra", symbol: "Db" },
  { code: "SYP", name: "Syrian Pound", symbol: "£" },
  { code: "TJS", name: "Tajikistani Somoni", symbol: "ЅМ" },
  { code: "TMT", name: "Turkmenistani Manat", symbol: "m" },
  { code: "TOP", name: "Tongan Paʻanga", symbol: "T$" },
  { code: "TTD", name: "Trinidad Dollar", symbol: "$" },
  { code: "TWD", name: "New Taiwan Dollar", symbol: "NT$" },
  { code: "UYU", name: "Uruguayan Peso", symbol: "$" },
  { code: "VES", name: "Venezuelan Bolívar", symbol: "Bs." },
  { code: "VUV", name: "Vanuatu Vatu", symbol: "Vt" },
  { code: "WST", name: "Samoan Tālā", symbol: "T" },
  { code: "XAF", name: "Central African CFA Franc", symbol: "Fr" },
  { code: "XCD", name: "East Caribbean Dollar", symbol: "$" },
  { code: "XOF", name: "West African CFA Franc", symbol: "Fr" },
  { code: "XPF", name: "CFP Franc", symbol: "Fr" },
  { code: "YER", name: "Yemeni Rial", symbol: "﷼" },
];

interface CurrencySelectorProps {
  selected: string;
  onChange: (value: string) => void;
}

export const CurrencySelector = ({ selected, onChange }: CurrencySelectorProps) => {
  const [popoverActive, setPopoverActive] = useState(false);
  const [query, setQuery] = useState<string>('');
  const [activeOptionId, setActiveOptionId] = useState<string>('');

  const togglePopoverActive = useCallback(
    () => setPopoverActive((popoverActive) => !popoverActive),
    []
  );

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
  }, []);

  const handleQueryClear = useCallback(() => {
    setQuery('');
  }, []);

  const handleCurrencySelect = useCallback((currencyCode: string) => {
    onChange(currencyCode);
    setPopoverActive(false);
    setQuery('');
  }, [onChange]);

  const handleActiveOptionChange = useCallback((_: string, domId: string) => {
    setActiveOptionId(domId);
  }, []);

  const selectedCurrency = currencies.find(c => c.code === selected);
  const selectedLabel = selectedCurrency 
    ? `${selectedCurrency.code} ${selectedCurrency.symbol}`
    : selected;

  const filteredCurrencies = query.trim()
    ? currencies.filter((currency) =>
        currency.code.toLowerCase().includes(query.toLowerCase().trim()) ||
        currency.name.toLowerCase().includes(query.toLowerCase().trim()) ||
        currency.symbol.includes(query.trim())
      )
    : currencies;

  const listboxId = 'currency-listbox';

  const activator = (
    <Button
      onClick={togglePopoverActive}
      disclosure={popoverActive ? 'up' : 'down'}
      icon={CurrencyConvertIcon as any}
    >
      {selectedLabel}
    </Button>
  );

  const optionMarkup =
    filteredCurrencies.length > 0
      ? filteredCurrencies.map((currency) => {
          const isSelected = currency.code === selected;

          return (
            <Listbox.Option
              key={currency.code}
              value={currency.code}
              selected={isSelected}
              accessibilityLabel={`${currency.name} (${currency.code} ${currency.symbol})`}
            >
              <Listbox.TextOption selected={isSelected}>
                {`${currency.code} ${currency.symbol} - ${currency.name}`}
              </Listbox.TextOption>
            </Listbox.Option>
          );
        })
      : null;

  const noResultsMarkup =
    filteredCurrencies.length === 0 ? (
      <EmptySearchResult
        title=""
        description={`No currencies found matching "${query}"`}
      />
    ) : null;

  return (
    <Popover
      active={popoverActive}
      activator={activator}
      onClose={togglePopoverActive}
      preferredAlignment="right"
      fullWidth
    >
      <div style={{ width: '400px' }}>
        <BlockStack>
          <div style={{ padding: '12px' }}>
            <TextField
              clearButton
              labelHidden
              label="Search currencies"
              placeholder="Search currencies"
              autoComplete="off"
              value={query}
              prefix={<Icon source={SearchIcon as any} />}
              ariaActiveDescendant={activeOptionId}
              ariaControls={listboxId}
              onChange={handleQueryChange}
              onClearButtonClick={handleQueryClear}
            />
          </div>
          <Scrollable
            shadow
            style={{
              position: 'relative',
              maxHeight: '300px',
              padding: 'var(--p-space-200) 0',
            }}
          >
            <Listbox
              enableKeyboardControl
              autoSelection={AutoSelection.FirstSelected}
              accessibilityLabel="Search for and select a currency"
              customListId={listboxId}
              onSelect={handleCurrencySelect}
              onActiveOptionChange={handleActiveOptionChange}
            >
              {optionMarkup}
              {noResultsMarkup}
            </Listbox>
          </Scrollable>
        </BlockStack>
      </div>
    </Popover>
  );
};

export const getCurrencySymbol = (code: string): string => {
  const currency = currencies.find((c) => c.code === code);
  return currency?.symbol || code;
};

export const getCurrencyName = (code: string): string => {
  const currency = currencies.find((c) => c.code === code);
  return currency?.name || code;
};
