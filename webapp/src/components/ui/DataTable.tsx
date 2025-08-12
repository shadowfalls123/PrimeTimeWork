import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn } from '../../util/cn';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';

export interface Column<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    showSizeChanger?: boolean;
    pageSizeOptions?: number[];
    onChange: (page: number, pageSize: number) => void;
  };
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  rowKey?: keyof T | ((record: T) => string);
  onRow?: (record: T, index: number) => {
    onClick?: () => void;
    className?: string;
  };
  emptyText?: string;
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const DataTable = <T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  pagination,
  searchable = false,
  searchPlaceholder = "Search...",
  onSearch,
  rowKey = 'id',
  onRow,
  emptyText = "No data available",
  className,
  size = 'medium',
}: DataTableProps<T>) => {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [searchValue, setSearchValue] = useState('');

  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  const cellPadding = {
    small: 'px-3 py-2',
    medium: 'px-4 py-3',
    large: 'px-6 py-4',
  };

  const handleSort = (columnKey: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key: columnKey, direction });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;
    
    return [...data].sort((a, b) => {
      const column = columns.find(col => col.key === sortConfig.key);
      if (!column) return 0;
      
      const aValue = column.dataIndex ? a[column.dataIndex] : a[sortConfig.key];
      const bValue = column.dataIndex ? b[column.dataIndex] : b[sortConfig.key];
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig, columns]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return String(record[rowKey] || index);
  };

  const renderCell = (column: Column<T>, record: T, index: number) => {
    const value = column.dataIndex ? record[column.dataIndex] : record[column.key];
    
    if (column.render) {
      return column.render(value, record, index);
    }
    
    return value;
  };

  const renderPagination = () => {
    if (!pagination) return null;
    
    const { current, pageSize, total, showSizeChanger, pageSizeOptions = [10, 20, 50, 100] } = pagination;
    const totalPages = Math.ceil(total / pageSize);
    const startItem = (current - 1) * pageSize + 1;
    const endItem = Math.min(current * pageSize, total);
    
    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700">
            Showing {startItem} to {endItem} of {total} results
          </span>
          
          {showSizeChanger && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Show:</span>
              <Select
                options={pageSizeOptions.map(size => ({ value: size.toString(), label: size.toString() }))}
                value={pageSize.toString()}
                onChange={(value) => pagination.onChange(1, parseInt(value as string))}
                className="w-20"
              />
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => pagination.onChange(current - 1, pageSize)}
            disabled={current <= 1}
          >
            <ChevronLeft size={16} />
            Previous
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (current <= 3) {
                pageNumber = i + 1;
              } else if (current >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = current - 2 + i;
              }
              
              return (
                <Button
                  key={pageNumber}
                  variant={current === pageNumber ? "primary" : "outline"}
                  size="sm"
                  onClick={() => pagination.onChange(pageNumber, pageSize)}
                  className="w-8 h-8 p-0"
                >
                  {pageNumber}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => pagination.onChange(current + 1, pageSize)}
            disabled={current >= totalPages}
          >
            Next
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 overflow-hidden', className)}>
      {searchable && (
        <div className="p-4 border-b border-gray-200">
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            leftIcon={<Search size={16} />}
            className="max-w-sm"
          />
        </div>
      )}
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    cellPadding[size],
                    'text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                    column.sortable && 'cursor-pointer hover:bg-gray-100 select-none',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.className
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ChevronUp
                          size={12}
                          className={cn(
                            'text-gray-400',
                            sortConfig?.key === column.key && sortConfig.direction === 'asc' && 'text-gray-900'
                          )}
                        />
                        <ChevronDown
                          size={12}
                          className={cn(
                            'text-gray-400 -mt-1',
                            sortConfig?.key === column.key && sortConfig.direction === 'desc' && 'text-gray-900'
                          )}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sage-500"></div>
                    <span className="text-gray-500">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                  {emptyText}
                </td>
              </tr>
            ) : (
              sortedData.map((record, index) => {
                const rowProps = onRow?.(record, index) || {};
                
                return (
                  <tr
                    key={getRowKey(record, index)}
                    className={cn(
                      'hover:bg-gray-50 transition-colors duration-150',
                      rowProps.onClick && 'cursor-pointer',
                      rowProps.className
                    )}
                    onClick={rowProps.onClick}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          cellPadding[size],
                          sizeClasses[size],
                          'text-gray-900 whitespace-nowrap',
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right',
                          column.className
                        )}
                        style={{ width: column.width }}
                      >
                        {renderCell(column, record, index)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {renderPagination()}
    </div>
  );
};

export { DataTable };