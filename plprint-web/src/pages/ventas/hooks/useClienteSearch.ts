import { useEffect, useState } from 'react';
import { clientesApi } from '@/api/clientes.api';

interface Cliente {
  id: number;
  nombre: string;
  telefono?: string;
}

export function useClienteSearch() {
  const [clienteSearch, setClienteSearch] = useState('');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [showClientes, setShowClientes] = useState(false);

  useEffect(() => {
    if (!clienteSearch.trim()) { setClientes([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await clientesApi.getAll({ search: clienteSearch, limit: 5 });
        setClientes(res.data?.data || []);
      } catch (_) { }
    }, 300);
    return () => clearTimeout(timer);
  }, [clienteSearch]);

  return { clienteSearch, setClienteSearch, clientes, showClientes, setShowClientes };
}
