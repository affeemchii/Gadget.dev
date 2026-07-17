import React, { useState, useCallback, useEffect } from 'react';
import {
  Popover,
  Button,
  TextField,
  Box,
  DatePicker,
  Icon,
  OptionList,
  Scrollable,
  InlineGrid,
  BlockStack,
  InlineStack,
  useBreakpoints
} from '@shopify/polaris';
import { ArrowRightIcon, CalendarIcon } from '@shopify/polaris-icons';

interface DateRange {
  start: Date;
  end: Date;
}

interface DateRangePickerProps {
  onDateRangeSelect: (range: DateRange) => void;
  value: Partial<DateRange>;
}

export const DateRangePicker = ({ onDateRangeSelect, value: { start, end } }: DateRangePickerProps) => {
  const { mdDown } = useBreakpoints();
  const [popoverActive, setPopoverActive] = useState(false);
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const yesterday = new Date(
    new Date(new Date().setDate(today.getDate() - 1)).setHours(0, 0, 0, 0)
  );
  const ranges = [
    { title: 'Today', period: { since: today, until: today } },
    { title: 'Yesterday', period: { since: yesterday, until: yesterday } },
    {
      title: 'Last 7 days',
      period: {
        since: new Date(new Date().setDate(today.getDate() - 7)),
        until: yesterday
      }
    },
    {
      title: 'Last 30 days',
      period: {
        since: new Date(new Date().setDate(today.getDate() - 30)),
        until: yesterday
      }
    },
    {
      title: 'Last 90 days',
      period: {
        since: new Date(new Date().setDate(today.getDate() - 90)),
        until: yesterday
      }
    },
    {
      title: 'Last 365 Days',
      period: {
        since: new Date(new Date().setDate(today.getDate() - 365)),
        until: yesterday
      }
    },
    {
      title: 'Custom',
      period: { since: yesterday, until: yesterday }
    }
  ];

  const getDefaultDateRange = () => {
    const areDatesEqual = (dateX: Date, dateY: Date) => dateX.toDateString() == dateY.toDateString();

    if (start && end) {
      const currentRange = ranges.find((range) => {
        const { since, until } = range.period;

        return areDatesEqual(since, start) && areDatesEqual(until, end)
      });

      if (currentRange) {
        return currentRange;
      } else {
        return { title: 'Custom', period: { since: start, until: end } };
      }
    }

    return ranges[0];
  };

  const defaultRange = getDefaultDateRange();
  const [activeDateRange, setActiveDateRange] = useState(defaultRange);
  const [dateState, setDateState] = useState({
    month: activeDateRange.period.since.getMonth(),
    year: activeDateRange.period.since.getFullYear()
  });

  const handleMonthChange = useCallback((month: number, year: number) => {
    setDateState({ month, year });
  }, []);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  useEffect(() => {
    setDateState({
      month: activeDateRange.period.since.getMonth(),
      year: activeDateRange.period.since.getFullYear()
    });
  }, [activeDateRange]);

  return (
    <Box>
      <Popover
        active={popoverActive}
        autofocusTarget='none'
        preferredAlignment='left'
        preferredPosition='below'
        fluidContent
        sectioned={false}
        fullHeight
        activator={
          <Button icon={CalendarIcon as any} onClick={() => setPopoverActive(!popoverActive)}>
            {activeDateRange.title}
          </Button>
        }
        onClose={() => setPopoverActive(false)}
      >
        <Box padding="400">
          <Popover.Pane fixed>
            <InlineGrid
              columns={{ xs: 1, md: 2 }}
              gap="0"
            >
              <Box
                maxWidth='212px'
                width='100%'
                paddingInlineEnd="500"
              >
                <Scrollable style={{ height: 'auto' }}>
                  <OptionList
                    options={ranges.map((range) => ({
                      value: range.title,
                      label: (
                        <div
                          style={{
                            minWidth: '120px'
                          }}
                        >
                          {range.title}
                        </div>
                      )
                    }))}
                    selected={[activeDateRange.title]}
                    onChange={(selected) => {
                      const selectedRange = ranges.find((range) => range.title === selected[0]);
                      if (selectedRange) {
                        setActiveDateRange(selectedRange);
                      }
                    }}
                  />
                </Scrollable>
              </Box>
              <Box maxWidth='516px'>
                <BlockStack gap='400'>
                  <InlineStack gap='200'>
                    <div style={{ flexGrow: 1 }}>
                      <TextField
                        label='Since'
                        role='combobox'
                        value={formatDate(activeDateRange.period.since)}
                        autoComplete='off'
                        readOnly
                      />
                    </div>
                    {!mdDown ? (
                      <Box paddingBlockStart="200">
                        <Icon source={ArrowRightIcon as any} tone='subdued' />
                      </Box>
                    ) : null}

                    <div style={{ flexGrow: 1 }}>
                      <TextField
                        label='Until'
                        role='combobox'
                        value={formatDate(activeDateRange.period.until)}
                        autoComplete='off'
                        readOnly
                      />
                    </div>
                  </InlineStack>
                  <div style={{ height: '256px' }}>
                    <DatePicker
                      month={dateState.month}
                      year={dateState.year}
                      selected={{
                        start: activeDateRange.period.since,
                        end: activeDateRange.period.until
                      }}
                      onChange={({ start, end }) => {
                        setActiveDateRange({
                          title: 'Custom',
                          period: { since: start, until: end }
                        });
                      }}
                      onMonthChange={handleMonthChange}
                      multiMonth={mdDown ? false : true}
                      allowRange
                    />
                  </div>
                </BlockStack>
              </Box>
            </InlineGrid>
          </Popover.Pane>
          <Popover.Pane fixed>
            <Popover.Section>
              <InlineStack align='end' gap='200'>
                <Button
                  onClick={() => {
                    setActiveDateRange(defaultRange);
                    setPopoverActive(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant='primary'
                  onClick={() => {
                    onDateRangeSelect({
                      start: activeDateRange.period.since,
                      end: activeDateRange.period.until
                    });
                    setPopoverActive(false);
                  }}
                >
                  Apply
                </Button>
              </InlineStack>
            </Popover.Section>
          </Popover.Pane>
        </Box>
      </Popover>
    </Box>
  );
};
