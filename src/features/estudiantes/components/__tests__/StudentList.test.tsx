import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../../hooks/useEstudiantes', () => ({
  useEstudiantes: vi.fn(),
  useCrearEstudiante: vi.fn(),
  useActualizarEstudiante: vi.fn(),
  useEliminarEstudiante: vi.fn(),
  useConteoRelaciones: vi.fn(),
  useCambiarEstadoEstudiante: vi.fn(),
}));

vi.mock('@/shared/components/ui/Button', () => ({
  Button: ({ children, onClick, type, isLoading, variant }: any) => (
    <button onClick={onClick} type={type} disabled={isLoading} data-variant={variant}>{children}</button>
  ),
}));

import { StudentList } from '../StudentList';
import * as hooks from '../../hooks/useEstudiantes';

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

const mockStudent = {
  id: 's1',
  nombres: 'Juan',
  apellidos: 'Pérez',
  documento: '12345',
  email: 'juan@test.com',
  programa: 'Ingeniería',
  semestre: 3,
  estado: 'ACTIVO',
  telefono: '3001234567',
  promedio_general: 4.2,
  promedio_acumulado: 3.8,
};

const mockUseEstudiantes = {
  data: { estudiantes: [mockStudent], total: 1 },
  isLoading: false,
  isError: false,
};

describe('StudentList — Notas modal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(hooks.useEstudiantes).mockReturnValue(mockUseEstudiantes as any);
    vi.mocked(hooks.useCrearEstudiante).mockReturnValue({ mutate: vi.fn(), isPending: false } as any);
    vi.mocked(hooks.useActualizarEstudiante).mockReturnValue({ mutate: vi.fn(), isPending: false } as any);
    vi.mocked(hooks.useEliminarEstudiante).mockReturnValue({ mutate: vi.fn(), isPending: false } as any);
    vi.mocked(hooks.useConteoRelaciones).mockReturnValue({ data: null, isLoading: false } as any);
    vi.mocked(hooks.useCambiarEstadoEstudiante).mockReturnValue({ mutate: vi.fn(), isPending: false } as any);
  });

  it('renders Notas button in actions column', async () => {
    renderWithProviders(<StudentList onSelectStudent={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByTitle('Editar notas')).toBeInTheDocument();
    });
  });

  it('opens modal with student averages on click', async () => {
    const user = userEvent.setup();
    renderWithProviders(<StudentList onSelectStudent={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByTitle('Editar notas')).toBeInTheDocument();
    });

    await user.click(screen.getByTitle('Editar notas'));

    expect(screen.getByText('Editar Notas')).toBeInTheDocument();
    expect(screen.getByText('Guardar Notas')).toBeInTheDocument();
  });

  it('shows current average values in modal inputs', async () => {
    const user = userEvent.setup();
    renderWithProviders(<StudentList onSelectStudent={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByTitle('Editar notas')).toBeInTheDocument();
    });

    await user.click(screen.getByTitle('Editar notas'));

    const inputs = screen.getAllByDisplayValue(/4\.2|3\.8/);
    expect(inputs.length).toBeGreaterThanOrEqual(1);
  });
});
