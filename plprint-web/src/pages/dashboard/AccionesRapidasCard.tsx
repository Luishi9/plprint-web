import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AccionesRapidasCardProps {
  usuarioRol?: string;
}

export function AccionesRapidasCard({ usuarioRol }: AccionesRapidasCardProps) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon name="bolt" size={18} className="text-[#2e9e9b]" /> Acciones Rápidas
        </CardTitle>
        <CardDescription>Acceso directo a funciones clave</CardDescription>
      </CardHeader>
      <CardContent className="pt-2 space-y-2">
        <Button variant="lime" className="w-full justify-start gap-3 font-semibold" onClick={() => navigate('/ventas/nueva')}>
          <Icon name="shopping_cart" size={18} /> Nueva Venta
        </Button>
        <Button variant="outline" className="w-full justify-start gap-3" onClick={() => navigate('/productos')}>
          <Icon name="inventory_2" size={18} /> Gestionar Productos
        </Button>
        <Button variant="outline" className="w-full justify-start gap-3" onClick={() => navigate('/inventario')}>
          <Icon name="bar_chart" size={18} /> Ver Inventario
        </Button>
        <Button variant="outline" className="w-full justify-start gap-3" onClick={() => navigate('/clientes')}>
          <Icon name="group" size={18} /> Clientes
        </Button>
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Informacion del Sistema</p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Versión</span>
              <span className="text-foreground font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Rol</span>
              <Badge variant="lime" className="text-xs py-0">{usuarioRol ?? 'N/A'}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Estado</span>
              <Badge variant="success" className="text-xs py-0">Online</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
