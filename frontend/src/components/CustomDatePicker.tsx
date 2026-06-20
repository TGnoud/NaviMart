import { useState, useRef, useEffect, useMemo } from 'react';

interface CustomDatePickerProps {
  value: string; // Format: YYYY-MM-DD
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

const MONTHS = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function toYYYYMMDD(year: number, month: number, day: number) {
  const y = year.toString();
  const m = (month + 1).toString().padStart(2, '0');
  const d = day.toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function CustomDatePicker({ value, onChange, className = '', placeholder = 'Chọn ngày' }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const initialDate = useMemo(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      }
    }
    return new Date();
  }, [value]);

  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (value) {
        const parts = value.split('-');
        if (parts.length === 3) {
          setCurrentYear(parseInt(parts[0]));
          setCurrentMonth(parseInt(parts[1]) - 1);
        }
      } else {
        const now = new Date();
        setCurrentYear(now.getFullYear());
        setCurrentMonth(now.getMonth());
      }
    }
  }, [isOpen, value]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleSelectDate = (day: number) => {
    onChange(toYYYYMMDD(currentYear, currentMonth, day));
    setIsOpen(false);
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  
  const displayValue = useMemo(() => {
    if (!value) return '';
    const parts = value.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return value;
  }, [value]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-full px-4 flex items-center justify-between outline-none cursor-pointer"
      >
        <span className="truncate pr-2">
          {displayValue ? displayValue : <span className="text-on-surface-variant opacity-70">{placeholder}</span>}
        </span>
        <span className="material-symbols-outlined text-on-surface-variant pointer-events-none">
          calendar_today
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-xl w-[300px]">
          <div className="flex justify-between items-center mb-4">
            <button type="button" onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <span className="font-headline-sm text-on-surface font-bold">
              {MONTHS[currentMonth]} {currentYear}
            </span>
            <button type="button" onClick={handleNextMonth} className="p-1 rounded-full hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {DAYS.map(day => (
              <span key={day} className="font-label-sm text-on-surface-variant text-xs font-bold py-1">
                {day}
              </span>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="p-2" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = toYYYYMMDD(currentYear, currentMonth, day);
              const isSelected = dateStr === value;
              const isToday = dateStr === toYYYYMMDD(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
              
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDate(day)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-body-md transition-colors mx-auto ${
                    isSelected 
                      ? 'bg-primary text-on-primary font-bold' 
                      : isToday
                        ? 'border border-primary text-primary font-bold hover:bg-primary-container'
                        : 'text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-outline-variant flex justify-between">
            <button 
              type="button" 
              onClick={() => onChange('')} 
              className="text-error font-label-sm px-3 py-1.5 rounded-md hover:bg-error-container/30 transition-colors"
            >
              Xóa
            </button>
            <button 
              type="button" 
              onClick={() => {
                const now = new Date();
                onChange(toYYYYMMDD(now.getFullYear(), now.getMonth(), now.getDate()));
                setIsOpen(false);
              }} 
              className="text-primary font-label-sm font-bold px-3 py-1.5 rounded-md hover:bg-primary-container/30 transition-colors"
            >
              Hôm nay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
