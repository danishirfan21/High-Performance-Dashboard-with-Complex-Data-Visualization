'use client';

import { useMemo, useState, useRef } from 'react';
import { useQuery, gql } from '@apollo/client';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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

export default function ProductsTable() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data, loading } = useQuery(GET_PRODUCTS, {
    variables: {
      limit: 100,
      offset: 0,
    },
  });

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

  if (loading) {
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
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </CardHeader>
      <CardContent>
        {/* Table Header */}
        <div className="border-b pb-3 mb-2">
          <div className="grid grid-cols-6 gap-4 text-sm font-medium text-muted-foreground">
            <div className="col-span-2">Product</div>
            <div>Category</div>
            <div className="text-right">Price</div>
            <div className="text-right">Sales</div>
            <div className="text-right">Revenue</div>
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
