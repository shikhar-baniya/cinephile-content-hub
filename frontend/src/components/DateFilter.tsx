import { useState } from "react";
import { Calendar, X, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DateFilterProps {
  onDateFilter: (filter: DateFilterValue) => void;
  onClear: () => void;
  currentFilter: DateFilterValue | null;
}

export interface DateFilterValue {
  type: 'specific' | 'month';
  date?: string; // YYYY-MM-DD format
  month?: string; // YYYY-MM format
  label: string;
}

const DateFilter = ({ onDateFilter, onClear, currentFilter }: DateFilterProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filterType, setFilterType] = useState<'specific' | 'month'>('specific');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  const handleApplyFilter = () => {
    if (filterType === 'specific' && selectedDate) {
      const date = new Date(selectedDate);
      const label = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      onDateFilter({
        type: 'specific',
        date: selectedDate,
        label: `Date: ${label}`
      });
    } else if (filterType === 'month' && selectedMonth) {
      const [year, month] = selectedMonth.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      const label = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
      onDateFilter({
        type: 'month',
        month: selectedMonth,
        label: `Month: ${label}`
      });
    }
    setIsExpanded(false);
  };

  const handleClear = () => {
    setSelectedDate('');
    setSelectedMonth('');
    setIsExpanded(false);
    onClear();
  };

  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().toISOString().slice(0, 7);

  return (
    <div className="relative">
      {/* Filter Button */}
      <Button
        variant={currentFilter ? "default" : "outline"}
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-2 ${
          currentFilter 
            ? "bg-gradient-to-r from-primary via-purple-500 to-pink-500" 
            : "border-border/60 text-muted-foreground hover:text-white"
        }`}
      >
        <Calendar className="h-4 w-4" />
        <span className="hidden sm:inline">
          {currentFilter ? currentFilter.label : 'Date Filter'}
        </span>
        <span className="sm:hidden">Date</span>
        {currentFilter && (
          <X 
            className="h-3 w-3 ml-1 hover:bg-white/20 rounded-full p-0.5" 
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
          />
        )}
      </Button>

      {/* Filter Dropdown */}
      {isExpanded && (
        <Card className="absolute top-full left-0 mt-2 w-80 z-[9999] bg-card/95 backdrop-blur-xl border border-border/60 shadow-xl">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                Date Filter
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Filter Type Selector */}
            <div className="flex gap-2">
              <Button
                variant={filterType === 'specific' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('specific')}
                className="flex-1"
              >
                Specific Date
              </Button>
              <Button
                variant={filterType === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('month')}
                className="flex-1"
              >
                Whole Month
              </Button>
            </div>

            {/* Date Input */}
            {filterType === 'specific' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Select Date
                </label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={today}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Shows content watched on this specific date
                </p>
              </div>
            )}

            {/* Month Input */}
            {filterType === 'month' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Select Month
                </label>
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  max={currentMonth}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Shows all content watched during this month
                </p>
              </div>
            )}

            {/* Quick Date Options */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Quick Options
              </label>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/20"
                  onClick={() => {
                    setFilterType('specific');
                    setSelectedDate(today);
                  }}
                >
                  Today
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/20"
                  onClick={() => {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    setFilterType('specific');
                    setSelectedDate(yesterday.toISOString().split('T')[0]);
                  }}
                >
                  Yesterday
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/20"
                  onClick={() => {
                    setFilterType('month');
                    setSelectedMonth(currentMonth);
                  }}
                >
                  This Month
                </Badge>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/20"
                  onClick={() => {
                    const lastMonth = new Date();
                    lastMonth.setMonth(lastMonth.getMonth() - 1);
                    setFilterType('month');
                    setSelectedMonth(lastMonth.toISOString().slice(0, 7));
                  }}
                >
                  Last Month
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2 border-t border-border/40">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                className="flex-1"
              >
                Clear Filter
              </Button>
              <Button
                size="sm"
                onClick={handleApplyFilter}
                disabled={
                  (filterType === 'specific' && !selectedDate) ||
                  (filterType === 'month' && !selectedMonth)
                }
                className="flex-1"
              >
                Apply Filter
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DateFilter;