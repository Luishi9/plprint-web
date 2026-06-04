import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  Boxes, UserCog, Building2, LogOut, PanelLeftClose, Tag, Settings, Truck, Ruler, Receipt, FolderTree, FileText, Trash2,
} from 'lucide-react';
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

const navItems = [
  { to: '/dashboard',  label: 'Dashboard',   icon: LayoutDashboard, modulo: 'dashboard' },
  { to: '/productos',  label: 'Productos',   icon: Package,         modulo: 'productos' },
  { to: '/insumos',    label: 'Insumos',     icon: Boxes,           modulo: 'insumos' },
  { to: '/ventas',     label: 'Ventas',      icon: ShoppingCart,    modulo: 'ventas' },
  { to: '/clientes',   label: 'Clientes',    icon: Users,           modulo: 'clientes' },
  { to: '/cotizaciones', label: 'Cotizaciones', icon: FileText,        modulo: 'cotizaciones' },
  { to: '/mermas',     label: 'Mermas',      icon: Trash2,          modulo: 'mermas' },
  { to: '/gastos',     label: 'Gastos',      icon: Receipt,         modulo: 'gastos' },
];

const adminItems = [
  { to: '/usuarios',             label: 'Usuarios',              icon: UserCog,    modulo: 'usuarios' },
  { to: '/categorias',           label: 'Categorías',            icon: Tag,        modulo: 'categorias' },
  { to: '/categorias-gastos',    label: 'Cat. de Gastos',        icon: FolderTree, modulo: 'gastos' },
  { to: '/proveedores',          label: 'Proveedores',           icon: Truck,      modulo: 'proveedores' },
  { to: '/unidades-medida',      label: 'Unidades de Medida',    icon: Ruler,      modulo: 'unidades_medida' },
  { to: '/sucursales',           label: 'Sucursales',            icon: Building2,  modulo: 'sucursales' },
];

export function AppSidebar() {
  const { usuario, logout } = useAuthStore();
  const navigate = useNavigate();
  const { setOpenMobile, setOpen, isMobile } = useSidebar();
  const { isModuloVisible, isAdmin } = usePermisos();
  const { src: logoSrc, isCustom: logoIsCustom } = useEmpresaLogo();

  const visibleNavItems = navItems.filter((i) => isModuloVisible(i.modulo));
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
        <button
          onClick={() => isMobile ? setOpenMobile(false) : setOpen(false)}
          className="text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors p-1"
          title="Ocultar menú"
        >
          <PanelLeftClose size={20} />
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
              {visibleNavItems.map(({ to, label, icon: Icon }) => (
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
                    <Icon size={17} />
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
                {visibleAdminItems.map(({ to, label, icon: Icon }) => (
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
                      <Icon size={17} />
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
            <Settings size={17} />
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
              <button
                onClick={handleLogout}
                className="text-sidebar-foreground/50 hover:text-red-400 transition-colors p-1 rounded cursor-pointer border-0 bg-transparent shrink-0"
                title="Cerrar sesión"
              >
                <LogOut size={16} />
              </button>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
