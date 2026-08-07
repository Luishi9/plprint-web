import { NavLink, useNavigate } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuthStore } from '@/store/authStore';
import { usePermisos } from '@/hooks/usePermisos';
import { useEmpresaLogo } from '@/hooks/useEmpresaLogo';
import { useCentroImpresion } from '@/hooks/useCentroImpresion';

const navItems = [
  { to: '/dashboard',  label: 'Dashboard',   icon: 'dashboard', modulo: 'dashboard' },
  { to: '/productos',  label: 'Productos',   icon: 'inventory_2',         modulo: 'productos' },
  { to: '/insumos',    label: 'Insumos',     icon: 'inventory',           modulo: 'insumos' },
  { to: '/ventas',     label: 'Ventas',      icon: 'shopping_cart',    modulo: 'ventas' },
  { to: '/clientes',   label: 'Clientes',    icon: 'group',           modulo: 'clientes' },
  { to: '/cotizaciones', label: 'Cotizaciones', icon: 'description',        modulo: 'cotizaciones' },
  { to: '/produccion', label: 'Producción',  icon: 'factory',         modulo: 'produccion' },
  { to: '/maquinas',   label: 'Máquinas',    icon: 'precision_manufacturing', modulo: 'maquinas' },
  { to: '/mermas',     label: 'Mermas',      icon: 'delete',          modulo: 'mermas' },
  { to: '/gastos',     label: 'Gastos',      icon: 'receipt',         modulo: 'gastos' },
  { to: '/caja',       label: 'Caja',        icon: 'account_balance_wallet',          modulo: 'caja' },
];

const adminItems = [
  { to: '/usuarios',             label: 'Usuarios',              icon: 'manage_accounts',    modulo: 'usuarios' },
  { to: '/categorias',           label: 'Categorías',            icon: 'sell',        modulo: 'categorias' },
  { to: '/categorias-gastos',    label: 'Cat. de Gastos',        icon: 'account_tree', modulo: 'gastos' },
  { to: '/proveedores',          label: 'Proveedores',           icon: 'local_shipping',      modulo: 'proveedores' },
  { to: '/unidades-medida',      label: 'Unidades de Medida',    icon: 'straighten',      modulo: 'unidades_medida' },
  { to: '/sucursales',           label: 'Sucursales',            icon: 'apartment',  modulo: 'sucursales' },
];

export function AppSidebar() {
  const { usuario, logout } = useAuthStore();
  const navigate = useNavigate();
  const { setOpenMobile, setOpen, isMobile } = useSidebar();
  const { isModuloVisible, isAdmin } = usePermisos();
  const { src: logoSrc, isCustom: logoIsCustom } = useEmpresaLogo();
  const { esCentroImpresion } = useCentroImpresion();

  const visibleNavItems = navItems.filter((i) => {
    if (!isModuloVisible(i.modulo)) return false;
    if (i.modulo === 'maquinas' && !esCentroImpresion) return false;
    return true;
  });
  const visibleAdminItems = isAdmin ? adminItems.filter((i) => isModuloVisible(i.modulo)) : [];

  const handleNavClick = () => {
    if (isMobile) setOpenMobile(false);
    else setOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Sidebar collapsible="offcanvas">
      {/* ─── Header: Logo ─── */}
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={logoSrc}
            alt="PLPrint"
            className="w-8 h-8 object-contain shrink-0"
            key={logoIsCustom ? 'custom' : 'default'}
          />
          <span
            className="font-bold text-[#2e9e9b] tracking-wide text-sm"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            PLPrint
          </span>
        </div>
        <button type="button"
          onClick={() => isMobile ? setOpenMobile(false) : setOpen(false)}
          className="text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors p-1"
          title="Ocultar menú"
        >
          <Icon name="dock_to_left" size={26} />
        </button>
      </SidebarHeader>

      {/* ─── Nav principal ─── */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-sidebar-foreground/40 uppercase tracking-widest">
            Navegación
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleNavItems.map(({ to, label, icon }) => (
                <SidebarMenuItem key={to}>
                  <NavLink
                    to={to}
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `flex items-center gap-3 w-full px-2 py-1.5 rounded-md text-sm no-underline transition-colors duration-150 ${
                        isActive
                          ? 'text-[#2e9e9b] font-semibold bg-sidebar-accent'
                          : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                      }`
                    }
                  >
                    <Icon name={icon} size={17} />
                    <span>{label}</span>
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin */}
        {visibleAdminItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs text-sidebar-foreground/40 uppercase tracking-widest">
              Administración
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleAdminItems.map(({ to, label, icon }) => (
                  <SidebarMenuItem key={to}>
                    <NavLink
                      to={to}
                      onClick={handleNavClick}
                      className={({ isActive }) =>
                        `flex items-center gap-3 w-full px-2 py-1.5 rounded-md text-sm no-underline transition-colors duration-150 ${
                          isActive
                            ? 'text-[#2e9e9b] font-semibold bg-sidebar-accent'
                            : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                        }`
                      }
                    >
                      <Icon name={icon} size={17} />
                      <span>{label}</span>
                    </NavLink>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* ─── Configuración: botón fijo siempre visible (solo admin o con permiso de config) ─── */}
      {isModuloVisible('configuracion') && (
        <div className="border-t border-sidebar-border p-2">
          <NavLink
            to="/configuracion"
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 w-full px-2 py-2 rounded-md text-sm no-underline transition-colors duration-150 ${
                isActive
                  ? 'text-[#2e9e9b] font-semibold bg-sidebar-accent'
                  : 'text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent'
              }`
            }
          >
            <Icon name="settings" size={17} />
            <span>Configuración</span>
          </NavLink>
        </div>
      )}

      {/* ─── Footer: Usuario + Logout ─── */}
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between px-2 py-1.5 gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">{usuario?.nombre}</p>
                <p className="text-xs text-sidebar-foreground/50 truncate">{usuario?.email}</p>
              </div>
              <button type="button"
                onClick={handleLogout}
                className="text-sidebar-foreground/50 hover:text-red-400 transition-colors p-1 rounded cursor-pointer border-0 bg-transparent shrink-0"
                title="Cerrar sesión"
              >
                <Icon name="logout" size={16} />
              </button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
