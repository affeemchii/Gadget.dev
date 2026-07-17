import React, { useState, useCallback } from 'react';
import {
  Popover,
  Button,
  Listbox,
  AutoSelection,
} from '@shopify/polaris';

interface ComparisonSelectorProps {
  selected: 'none' | 'previous_period' | 'benchmarks';
  onChange: (value: 'none' | 'previous_period' | 'benchmarks') => void;
}

export const ComparisonSelector = ({ selected, onChange }: ComparisonSelectorProps) => {
  const [popoverActive, setPopoverActive] = useState(false);

  const togglePopoverActive = useCallback(
    () => setPopoverActive((popoverActive) => !popoverActive),
    []
  );

  const handleComparisonSelect = useCallback((value: string) => {
    onChange(value as 'none' | 'previous_period' | 'benchmarks');
    setPopoverActive(false);
  }, [onChange]);

  const options = [
    { label: 'No comparison', value: 'none' },
    { label: 'Comparison to past', value: 'previous_period' },
    { label: 'Benchmarks', value: 'benchmarks' },
  ];

  const selectedOption = options.find(opt => opt.value === selected);
  const selectedLabel = selectedOption?.label || 'Select comparison';

  const listboxId = 'comparison-listbox';

  const activator = (
    <Button
      onClick={togglePopoverActive}
      disclosure={popoverActive ? 'up' : 'down'}
    >
      {selectedLabel}
    </Button>
  );

  const optionMarkup = options.map((option) => {
    const isSelected = option.value === selected;

    return (
      <Listbox.Option
        key={option.value}
        value={option.value}
        selected={isSelected}
        accessibilityLabel={option.label}
      >
        <Listbox.TextOption selected={isSelected}>
          {option.label}
        </Listbox.TextOption>
      </Listbox.Option>
    );
  });

  return (
    <Popover
      active={popoverActive}
      activator={activator}
      onClose={togglePopoverActive}
      preferredAlignment="left"
    >
      <Listbox
        enableKeyboardControl
        autoSelection={AutoSelection.FirstSelected}
        accessibilityLabel="Select comparison mode"
        customListId={listboxId}
        onSelect={handleComparisonSelect}
      >
        {optionMarkup}
      </Listbox>
    </Popover>
  );
};
