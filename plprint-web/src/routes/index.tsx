import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import Layout from '@/components/layout/Layout';

const LoginPage      = lazy(() => import('@/pages/auth/LoginPage'));
const DashboardPage  = lazy(() => import('@/pages/dashboard/DashboardPage'));
const ProductosPage  = lazy(() => import('@/pages/productos/ProductosPage'));
const VentasPage     = lazy(() => import('@/pages/ventas/VentasPage'));
const NuevaVentaPage = lazy(() => import('@/pages/ventas/NuevaVentaPage'));
const ClientesPage   = lazy(() => import('@/pages/clientes/ClientesPage'));
const InsumosPage    = lazy(() => import('@/pages/insumos/InsumosPage'));
const UsuariosPage   = lazy(() => import('@/pages/usuarios/UsuariosPage'));
const CategoriasPage   = lazy(() => import('@/pages/categorias/CategoriasPage'));
const SucursalesPage   = lazy(() => import('@/pages/sucursales/SucursalesPage'));
const ProveedoresPage  = lazy(() => import('@/pages/proveedores/ProveedoresPage'));
const UnidadesMedidaPage = lazy(() => import('@/pages/unidades-medida/UnidadesMedidaPage'));
const GastosPage = lazy(() => import('@/pages/gastos/GastosPage'));
const CategoriasGastosPage = lazy(() => import('@/pages/gastos/CategoriasGastosPage'));
const CotizacionesPage = lazy(() => import('@/pages/cotizaciones/CotizacionesPage'));
const MermasPage = lazy(() => import('@/pages/mermas/MermasPage'));
const ProduccionPage = lazy(() => import('@/pages/produccion/ProduccionPage'));
const MaquinasPage = lazy(() => import('@/pages/maquinas/MaquinasPage'));
const TicketPublicoPage = lazy(() => import('@/pages/ventas/TicketPublicoPage'));
const ConfiguracionPage = lazy(() => import('@/pages/configuracion/ConfiguracionPage'));
const CajaPage = lazy(() => import('@/pages/caja/CajaPage'));

const Loader = () => (
  <div className="flex h-dvh items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
  </div>
);

export const AppRoutes = () => (
  <Suspense fallback={<Loader />}>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/ticket" element={<TicketPublicoPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"  element={<DashboardPage />} />
          <Route path="/productos"  element={<ProductosPage />} />
          <Route path="/ventas"     element={<VentasPage />} />
          <Route path="/ventas/nueva" element={<NuevaVentaPage />} />
          <Route path="/clientes"   element={<ClientesPage />} />
          <Route path="/insumos"    element={<InsumosPage />} />
          <Route path="/inventario" element={<Navigate to="/insumos" replace />} />
          <Route path="/usuarios"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UsuariosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categorias"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CategoriasPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sucursales"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SucursalesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/proveedores"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ProveedoresPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/unidades-medida"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UnidadesMedidaPage />
              </ProtectedRoute>
            }
          />
          <Route path="/gastos" element={<GastosPage />} />
          <Route path="/caja" element={<CajaPage />} />
          <Route path="/cotizaciones" element={<CotizacionesPage />} />
          <Route path="/mermas" element={<MermasPage />} />
          <Route path="/produccion" element={<ProduccionPage />} />
          <Route path="/maquinas" element={<MaquinasPage />} />
          <Route
            path="/categorias-gastos"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CategoriasGastosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/configuracion"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ConfiguracionPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </Suspense>
);
