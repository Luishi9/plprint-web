import { useEffect, useRef, useState } from 'react';
import { productosApi } from '@/api/productos.api';

interface ProductoCatalogoSearch {
  id: number;
  nombre: string;
  precio_venta: string;
  imagen_url: string | null;
  codigo: string | null;
  producto_precios?: Array<{ nivel: string; cantidad_minima: number; precio: number | string; activo: boolean }>;
  unidad_info?: { es_medida: boolean; tipo_medida: 'm2' | 'ml' | null };
  ancho_rollo?: number | null;
  cobrar_minimo_1?: boolean;
}

export function useProductSearch(sucursalId?: number) {
  const [productSearch, setProductSearch] = useState('');
  const [productos, setProductos] = useState<ProductoCatalogoSearch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await productosApi.getAll({
          search: productSearch || undefined,
          limit: 20,
          ...(sucursalId && { sucursalId }),
        });
        setProductos(res.data?.data || []);
      } catch (e: any) {
        if (e?.code !== 'ERR_CANCELED') console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [productSearch, sucursalId]);

  return { productSearch, setProductSearch, productos, setProductos, isSearching };
}
