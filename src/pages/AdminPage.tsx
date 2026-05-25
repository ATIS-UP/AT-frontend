import { Helmet } from 'react-helmet-async';
import { AdminUsers } from '../features/admin/components/AdminUsers';

export default function AdminPage() {
  return (
    <>
      <Helmet>
        <title>SATISUP - Administración</title>
        <meta name="description" content="Gestión de usuarios y permisos del sistema - Universidad de Pamplona." />
      </Helmet>
      <AdminUsers />
    </>
  );
}
