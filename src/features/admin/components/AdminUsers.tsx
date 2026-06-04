import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService, type Usuario } from '../services/adminService';
import { Button } from '@/shared/components/ui/Button';
import { Card } from '@/shared/components/ui/Card';
import { Badge } from '@/shared/components/ui/Badge';
import { createCharFilter, CharType } from '@/lib/validation';
import { Modal } from '@/shared/components/ui/Modal';
import { useNotificationStore } from '@/shared/stores/notification.store';
import { Search, Plus, Pencil, Trash2, Shield, ChevronLeft, ChevronRight } from 'lucide-react';

const ROLES = [
  { value: 'ADMINISTRADOR', label: 'Administrador' },
  { value: 'DOCENTE', label: 'Docente' },
  { value: 'APOYO', label: 'Apoyo' },
];

export function AdminUsers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const limit = 20;

  const { data: usuarios, isLoading } = useQuery({
    queryKey: ['admin', 'usuarios', page, search, filtroRol],
    queryFn: () => adminService.listarUsuarios({ pagina: page, por_pagina: limit, buscar: search || undefined, rol: filtroRol || undefined }),
  });

  const usuariosList = Array.isArray(usuarios) ? usuarios : [];

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [showPermisosModal, setShowPermisosModal] = useState(false);
  const [permisosUserId, setPermisosUserId] = useState<string | null>(null);

  const [form, setForm] = useState({ email: '', password: '', nombre: '', rol: 'DOCENTE', is_active: true });

  const queryClient = useQueryClient();
  const notify = useNotificationStore.getState().add;

  const inval = () => queryClient.invalidateQueries({ queryKey: ['admin', 'usuarios'] });

  const crearMutation = useMutation({
    mutationFn: (data: typeof form) => adminService.crearUsuario(data),
    onSuccess: () => { inval(); setShowCreateModal(false); resetForm(); notify({ type: 'success', message: 'Usuario creado' }); },
    onError: () => notify({ type: 'error', message: 'Error al crear usuario' }),
  });

  const actualizarMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<typeof form> }) => adminService.actualizarUsuario(id, data),
    onSuccess: () => { inval(); setShowCreateModal(false); setEditingUser(null); resetForm(); notify({ type: 'success', message: 'Usuario actualizado' }); },
    onError: () => notify({ type: 'error', message: 'Error al actualizar usuario' }),
  });

  const eliminarMutation = useMutation({
    mutationFn: (id: string) => adminService.eliminarUsuario(id),
    onSuccess: () => { inval(); setShowDeleteModal(false); setDeleteUserId(null); notify({ type: 'success', message: 'Usuario desactivado' }); },
    onError: () => notify({ type: 'error', message: 'Error al desactivar usuario' }),
  });

  const resetForm = () => setForm({ email: '', password: '', nombre: '', rol: 'DOCENTE', is_active: true });

  const openEdit = (u: Usuario) => {
    setEditingUser(u);
    setForm({ email: u.email, password: '', nombre: u.nombre, rol: u.rol, is_active: u.is_active });
    setShowCreateModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.email.trim()) {
      notify({ type: 'warning', message: 'Nombre y email son requeridos' });
      return;
    }
    if (editingUser) {
      const payload: Partial<typeof form> = {};
      if (form.nombre !== editingUser.nombre) payload.nombre = form.nombre;
      if (form.email !== editingUser.email) payload.email = form.email;
      if (form.rol !== editingUser.rol) payload.rol = form.rol;
      if (form.is_active !== editingUser.is_active) payload.is_active = form.is_active;
      if (form.password) payload.password = form.password;
      if (Object.keys(payload).length === 0) { notify({ type: 'info', message: 'Sin cambios' }); return; }
      actualizarMutation.mutate({ id: editingUser.id, data: payload });
    } else {
      if (!form.password) { notify({ type: 'warning', message: 'Contraseña requerida' }); return; }
      crearMutation.mutate(form);
    }
  };

  const total = usuariosList.length;
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-display text-brand-primary">Usuarios</h2>
          <p className="text-slate-500 text-sm">Gestión de usuarios del sistema</p>
        </div>
        <Button onClick={() => { setEditingUser(null); resetForm(); setShowCreateModal(true); }}>
          <Plus className="w-4 h-4 mr-2" /> Nuevo Usuario
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            className="w-full border border-slate-200 pl-9 pr-3 py-2 rounded-lg text-sm focus:border-brand-primary outline-none"
            placeholder="Buscar por email o nombre..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          value={filtroRol}
          onChange={(e) => { setFiltroRol(e.target.value); setPage(1); }}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-brand-primary"
        >
          <option value="">Todos los roles</option>
          {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary" />
        </div>
      ) : usuariosList.length === 0 ? (
        <Card className="text-center py-8"><p className="text-slate-500 text-sm">No hay usuarios</p></Card>
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-50/50">
                  <th className="pb-3 pt-4 px-6 font-semibold">Nombre</th>
                  <th className="pb-3 pt-4 px-6 font-semibold">Email</th>
                  <th className="pb-3 pt-4 px-6 font-semibold">Rol</th>
                  <th className="pb-3 pt-4 px-6 font-semibold">Estado</th>
                  <th className="pb-3 pt-4 px-6 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuariosList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-800">{u.nombre}</td>
                    <td className="py-4 px-6 text-slate-600 text-xs">{u.email}</td>
                    <td className="py-4 px-6"><Badge variant="outline">{u.rol}</Badge></td>
                    <td className="py-4 px-6">
                      <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${u.is_active ? 'text-emerald-700 bg-emerald-50' : 'text-slate-400 bg-slate-100'}`}>
                        {u.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="text-xs" onClick={() => openEdit(u)}>
                          <Pencil className="w-3.5 h-3.5 mr-1" /> Editar
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs text-blue-500" onClick={() => { setPermisosUserId(u.id); setShowPermisosModal(true); }}>
                          <Shield className="w-3.5 h-3.5 mr-1" /> Permisos
                        </Button>
                        {u.is_active && (
                          <Button variant="ghost" size="sm" className="text-xs text-red-500" onClick={() => { setDeleteUserId(u.id); setShowDeleteModal(true); }}>
                            <Trash2 className="w-3.5 h-3.5 mr-1" /> Desactivar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {total > limit && (
            <div className="px-6 py-3 flex items-center justify-between border-t border-slate-100">
              <span className="text-xs text-slate-400">{total} usuario(s)</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs text-slate-600">{page} / {totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* create/edit modal */}
      <Modal
        open={showCreateModal}
        onOpenChange={(o) => { if (!o) { setShowCreateModal(false); setEditingUser(null); resetForm(); } }}
        title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        description={editingUser ? `Editando: ${editingUser.nombre}` : 'Crear un nuevo usuario del sistema'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Nombre *</label>
            <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: createCharFilter(CharType.LETTERS)(e.target.value) })} maxLength={100}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Email *</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: createCharFilter(CharType.EMAIL)(e.target.value) })} maxLength={100}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">{editingUser ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Rol</label>
              <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none">
                {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Estado</label>
              <select value={form.is_active ? 'true' : 'false'} onChange={(e) => setForm({ ...form, is_active: e.target.value === 'true' })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-brand-primary outline-none">
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => { setShowCreateModal(false); setEditingUser(null); resetForm(); }}>Cancelar</Button>
            <Button type="submit" isLoading={crearMutation.isPending || actualizarMutation.isPending}>
              {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* delete confirmation */}
      <Modal open={showDeleteModal} onOpenChange={(o) => { if (!o) setShowDeleteModal(false); }}
        title="Desactivar Usuario" description="El usuario no podrá iniciar sesión. Esta acción es reversible."
      >
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancelar</Button>
          <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50"
            onClick={() => { if (deleteUserId) eliminarMutation.mutate(deleteUserId); }}
            isLoading={eliminarMutation.isPending}>Desactivar</Button>
        </div>
      </Modal>

      {/* permisos modal */}
      <PermisosModal userId={permisosUserId} open={showPermisosModal} onOpenChange={(o) => { setShowPermisosModal(o); if (!o) setPermisosUserId(null); }} />
    </div>
  );
}

function PermisosModal({ userId, open, onOpenChange }: { userId: string | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient();
  const notify = useNotificationStore.getState().add;

  const { data: catalogo } = useQuery({
    queryKey: ['admin', 'permisos', 'catalogo'],
    queryFn: () => adminService.obtenerPermisosCatalogo(),
    enabled: open,
  });

  const { data: userPermisos, isLoading } = useQuery({
    queryKey: ['admin', 'permisos', userId],
    queryFn: () => adminService.obtenerPermisosUsuario(userId!),
    enabled: open && !!userId,
  });

  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (userPermisos?.overrides) {
      const map: Record<string, boolean> = {};
      for (const o of userPermisos.overrides) map[o.codigo] = o.tiene_permiso;
      setOverrides(map);
    }
  }, [userPermisos]);

  const permisoMutation = useMutation({
    mutationFn: (permisos: { codigo: string; tiene_permiso: boolean }[]) =>
      adminService.actualizarPermisosUsuario(userId!, permisos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'permisos', userId] });
      notify({ type: 'success', message: 'Permisos actualizados' });
    },
    onError: () => notify({ type: 'error', message: 'Error al actualizar permisos' }),
  });

  const handleToggle = (codigo: string) => {
    setOverrides((prev) => {
      const next = { ...prev };
      if (next[codigo] === false) delete next[codigo];
      else next[codigo] = false;
      return next;
    });
  };

  const savePermisos = () => {
    const list = Object.entries(overrides).map(([codigo, tiene_permiso]) => ({ codigo, tiene_permiso }));
    permisoMutation.mutate(list);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Permisos del Usuario"
      description={userPermisos ? `Rol base: ${userPermisos.rol}` : 'Cargando...'}
      className="max-w-2xl"
    >
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary" />
        </div>
      ) : catalogo && userPermisos ? (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <p className="text-xs text-slate-500">
            Marque como <strong>✓ Denegado</strong> para revocar un permiso específico que el rol otorga.
          </p>
          {Object.entries(catalogo as Record<string, any[]>).map(([categoria, permisos]) => (
            <div key={categoria}>
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 border-b pb-1">{categoria}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {permisos.map((p: any) => {
                  const concedido = userPermisos.permisos.some((pp) => pp.codigo === p.codigo);
                  const override = overrides[p.codigo];
                  const denegado = override === false;
                  return (
                    <label key={p.codigo} className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer transition-colors ${denegado ? 'bg-red-50' : 'bg-green-50'}`}>
                      <input type="checkbox" checked={!denegado} onChange={() => handleToggle(p.codigo)} className="accent-brand-primary" />
                      <span className={denegado ? 'text-red-700 line-through' : 'text-green-700'}>{p.nombre || p.codigo}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="flex justify-end gap-3 pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
            <Button type="button" onClick={savePermisos} isLoading={permisoMutation.isPending}>Guardar Permisos</Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500 text-center py-4">No se pudieron cargar los permisos</p>
      )}
    </Modal>
  );
}
