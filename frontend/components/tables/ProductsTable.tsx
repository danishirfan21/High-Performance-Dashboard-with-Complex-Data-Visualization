'use client';

import { useMemo, useState, useRef } from 'react';
import { useQuery, gql } from '@apollo/client';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, ArrowUpDown, Download } from 'lucide-react';
import axiosClient from '@/lib/axios-client';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/useDebounce';

const GET_PRODUCTS = gql`
  query GetProducts($filter: ProductFilterInput, $limit: Int, $offset: Int) {
    getProducts(filter: $filter, limit: $limit, offset: $offset) {
      id
      name
      category
      price
      totalSales
      revenue
      rating
    }
  }
`;

type SortField = 'name' | 'category' | 'price' | 'totalSales' | 'revenue';

const COLUMNS: { field: SortField; label: string; className: string }[] = [
  { field: 'name', label: 'Product', className: 'col-span-2' },
  { field: 'category', label: 'Category', className: '' },
  { field: 'price', label: 'Price', className: 'justify-end' },
  { field: 'totalSales', label: 'Sales', className: 'justify-end' },
  { field: 'revenue', label: 'Revenue', className: 'justify-end' },
];

export default function ProductsTable() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [sortBy, setSortBy] = useState<SortField>('revenue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const { data, loading } = useQuery(GET_PRODUCTS, {
    variables: {
      filter: { sortBy, sortOrder },
      limit: 100,
      offset: 0,
    },
  });

  const toggleSort = (field: SortField) => {
    if (field === sortBy) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder(field === 'name' || field === 'category' ? 'asc' : 'desc');
    }
  };

  const exportCsv = async () => {
    setExporting(true);
    setExportError(null);
    try {
      const res = await axiosClient.get('/export/products', { responseType: 'blob' });
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'products-export.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setExportError('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const products = useMemo(() => {
    if (!data?.getProducts) return [];

    if (!debouncedSearch) return data.getProducts;

    return data.getProducts.filter((p: any) =>
      p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [data, debouncedSearch]);

  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: products.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 5,
  });

  if (loading && !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Products</CardTitle>
        <div className="flex items-center justify-between gap-4">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={exporting}>
            <Download className="h-4 w-4" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </div>
        {exportError && <p className="text-sm text-destructive">{exportError}</p>}
      </CardHeader>
      <CardContent>
        {/* Table Header */}
        <div className="border-b pb-3 mb-2">
          <div className="grid grid-cols-6 gap-4 text-sm font-medium text-muted-foreground">
            {COLUMNS.map(({ field, label, className }) => {
              const active = sortBy === field;
              const Icon = !active ? ArrowUpDown : sortOrder === 'asc' ? ArrowUp : ArrowDown;
              return (
                <button
                  key={field}
                  type="button"
                  onClick={() => toggleSort(field)}
                  aria-label={`Sort by ${label}`}
                  className={`flex items-center gap-1 hover:text-foreground ${className} ${active ? 'text-foreground' : ''}`}
                >
                  {label}
                  <Icon className="h-3 w-3" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Virtualized Table Body */}
        <div
          ref={parentRef}
          className="h-[400px] overflow-auto"
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const product = products[virtualRow.index];
              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="grid grid-cols-6 gap-4 items-center py-3 px-2 border-b hover:bg-muted/50 transition-colors"
                >
                  <div className="col-span-2 font-medium truncate">{product.name}</div>
                  <div className="text-sm text-muted-foreground">{product.category}</div>
                  <div className="text-sm text-right">${product.price}</div>
                  <div className="text-sm text-right">{product.totalSales} units</div>
                  <div className="text-sm text-right font-semibold">
                    ${product.revenue.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Showing {products.length} products
        </div>
      </CardContent>
    </Card>
  );
}
