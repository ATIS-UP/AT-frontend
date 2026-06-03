import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ResponderEncuesta } from '../ResponderEncuesta';

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useParams: () => ({ encuestaId: 'e1' }),
}));

vi.mock('../../services/encuestasService', () => ({
  encuestasService: {
    obtenerInfoPublica: vi.fn(),
    verificarEstudiante: vi.fn(),
    responderPublico: vi.fn(),
  },
}));

import { encuestasService } from '../../services/encuestasService';

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('ResponderEncuesta', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the document verification step', async () => {
    vi.mocked(encuestasService.obtenerInfoPublica).mockResolvedValue({
      id: 'e1', titulo: 'Encuesta Test', descripcion: null,
      preguntas: [{ id: 1, texto: 'P1', tipo: 'texto_libre', requerida: true }],
    });

    renderWithProviders(<ResponderEncuesta />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Número de documento')).toBeInTheDocument();
    });
    expect(screen.getByText('Verificar')).toBeInTheDocument();
  });

  it('should show verified student name after valid documento', async () => {
    vi.mocked(encuestasService.obtenerInfoPublica).mockResolvedValue({
      id: 'e1', titulo: 'Encuesta Test', descripcion: null,
      preguntas: [
        { id: 1, texto: 'P1', tipo: 'texto_libre', requerida: true },
      ],
    });
    vi.mocked(encuestasService.verificarEstudiante).mockResolvedValue({
      existe: true, ya_respondio: false, puede_responder: true,
      estudiante_nombre: 'Juan Pérez', estudiante_id: 'est-1',
      preguntas: [
        { id: 1, texto: 'P1', tipo: 'texto_libre', requerida: false, campo: null, editable: true, valor_actual: null },
      ],
    });

    renderWithProviders(<ResponderEncuesta />);
    await waitFor(() => screen.getByPlaceholderText('Número de documento'));

    await userEvent.type(screen.getByPlaceholderText('Número de documento'), '12345678');
    await userEvent.click(screen.getByText('Verificar'));

    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });
  });

  it('should show error on invalid documento', async () => {
    vi.mocked(encuestasService.obtenerInfoPublica).mockResolvedValue({
      id: 'e1', titulo: 'Test', descripcion: null,
      preguntas: [{ id: 1, texto: 'P1', tipo: 'texto_libre', requerida: true }],
    });
    vi.mocked(encuestasService.verificarEstudiante).mockResolvedValue({
      existe: false, ya_respondio: false, puede_responder: false,
      estudiante_nombre: null, estudiante_id: null,
    });

    renderWithProviders(<ResponderEncuesta />);
    await waitFor(() => screen.getByPlaceholderText('Número de documento'));

    await userEvent.type(screen.getByPlaceholderText('Número de documento'), '999');
    await userEvent.click(screen.getByText('Verificar'));

    await waitFor(() => {
      expect(screen.getByText(/no coincide con un estudiante/)).toBeInTheDocument();
    });
  });
});
