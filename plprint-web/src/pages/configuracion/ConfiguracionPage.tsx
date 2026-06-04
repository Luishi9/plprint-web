import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Building2, Shield, CreditCard, Database, Bell, ScrollText } from 'lucide-react';
import GeneralTab from './components/GeneralTab';
import RolesTab from './components/RolesTab';
import MetodosPagoTab from './components/MetodosPagoTab';
import RespaldoTab from './components/RespaldoTab';
import NotificacionesTab from './components/NotificacionesTab';
import AuditLogTab from './components/AuditLogTab';

export default function ConfiguracionPage() {
  return (
    <div className="flex-1 flex flex-col gap-4 min-h-0">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="text-[#2e9e9b]" size={22} /> Configuración
        </h1>
        <p className="text-sm text-muted-foreground">Ajustes del sistema, roles, métodos de pago y respaldos</p>
      </div>

      <Tabs defaultValue="general" className="flex-1 flex flex-col min-h-0">
        <div className="border-b border-border overflow-x-auto">
          <TabsList className="bg-transparent h-auto p-0 gap-1">
            <TabsTrigger value="general" className="data-[state=active]:bg-[#2e9e9b]/10 data-[state=active]:text-[#2e9e9b] rounded-b-none border-b-2 border-transparent data-[state=active]:border-[#2e9e9b] py-2.5">
              <Building2 size={14} className="mr-1.5" /> General
            </TabsTrigger>
            <TabsTrigger value="roles" className="data-[state=active]:bg-[#2e9e9b]/10 data-[state=active]:text-[#2e9e9b] rounded-b-none border-b-2 border-transparent data-[state=active]:border-[#2e9e9b] py-2.5">
              <Shield size={14} className="mr-1.5" /> Roles
            </TabsTrigger>
            <TabsTrigger value="metodos-pago" className="data-[state=active]:bg-[#2e9e9b]/10 data-[state=active]:text-[#2e9e9b] rounded-b-none border-b-2 border-transparent data-[state=active]:border-[#2e9e9b] py-2.5">
              <CreditCard size={14} className="mr-1.5" /> Métodos de pago
            </TabsTrigger>
            <TabsTrigger value="notificaciones" className="data-[state=active]:bg-[#2e9e9b]/10 data-[state=active]:text-[#2e9e9b] rounded-b-none border-b-2 border-transparent data-[state=active]:border-[#2e9e9b] py-2.5">
              <Bell size={14} className="mr-1.5" /> Notificaciones
            </TabsTrigger>
            <TabsTrigger value="respaldo" className="data-[state=active]:bg-[#2e9e9b]/10 data-[state=active]:text-[#2e9e9b] rounded-b-none border-b-2 border-transparent data-[state=active]:border-[#2e9e9b] py-2.5">
              <Database size={14} className="mr-1.5" /> Respaldo
            </TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:bg-[#2e9e9b]/10 data-[state=active]:text-[#2e9e9b] rounded-b-none border-b-2 border-transparent data-[state=active]:border-[#2e9e9b] py-2.5">
              <ScrollText size={14} className="mr-1.5" /> Auditoría
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto pt-4">
          <TabsContent value="general" className="mt-0"><GeneralTab /></TabsContent>
          <TabsContent value="roles" className="mt-0"><RolesTab /></TabsContent>
          <TabsContent value="metodos-pago" className="mt-0"><MetodosPagoTab /></TabsContent>
          <TabsContent value="notificaciones" className="mt-0"><NotificacionesTab /></TabsContent>
          <TabsContent value="respaldo" className="mt-0"><RespaldoTab /></TabsContent>
          <TabsContent value="audit" className="mt-0"><AuditLogTab /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
