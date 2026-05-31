import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Register from './Register';

const navigateMock = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom',
    );
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const signUpWithEmail = vi.fn();
const updateAuthUserMetadata = vi.fn();
vi.mock('@app/core/services/auth.service', () => ({
  signUpWithEmail: (...args: unknown[]) => signUpWithEmail(...args),
  updateAuthUserMetadata: (...args: unknown[]) =>
    updateAuthUserMetadata(...args),
}));

const uploadAvatar = vi.fn();
const updateProfile = vi.fn();
vi.mock('@app/core/services/profile.service', () => ({
  uploadAvatar: (...args: unknown[]) => uploadAvatar(...args),
  updateProfile: (...args: unknown[]) => updateProfile(...args),
}));

beforeEach(() => {
  navigateMock.mockReset();
  signUpWithEmail.mockReset();
  updateAuthUserMetadata
    .mockReset()
    .mockResolvedValue({ data: {}, error: null });
  uploadAvatar.mockReset();
  updateProfile.mockReset().mockResolvedValue({});
  if (!URL.createObjectURL) {
    Object.defineProperty(URL, 'createObjectURL', {
      value: vi.fn(() => 'blob:preview'),
      configurable: true,
    });
  } else {
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:preview');
  }
  if (!URL.revokeObjectURL) {
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: vi.fn(),
      configurable: true,
    });
  }
});

const renderRegister = () =>
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>,
  );

const fillValid = () => {
  fireEvent.input(screen.getByPlaceholderText('register.email.placeholder'), {
    target: { value: 'alice@example.com' },
  });
  fireEvent.input(
    screen.getByPlaceholderText('register.password.placeholder'),
    {
      target: { value: 'secret123' },
    },
  );
  fireEvent.input(
    screen.getByPlaceholderText('register.confirmPassword.placeholder'),
    { target: { value: 'secret123' } },
  );
  fireEvent.input(
    screen.getByPlaceholderText('register.displayName.placeholder'),
    { target: { value: '  Alice  ' } },
  );
};

const makeFile = (name: string, type: string, size: number) => {
  const file = new File(['x'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('Register form', () => {
  it('requires display name', async () => {
    renderRegister();
    fireEvent.input(screen.getByPlaceholderText('register.email.placeholder'), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.input(
      screen.getByPlaceholderText('register.password.placeholder'),
      { target: { value: 'secret123' } },
    );
    fireEvent.input(
      screen.getByPlaceholderText('register.confirmPassword.placeholder'),
      { target: { value: 'secret123' } },
    );
    const displayName = screen.getByPlaceholderText(
      'register.displayName.placeholder',
    );
    fireEvent.input(displayName, { target: { value: '   ' } });
    fireEvent.blur(displayName);

    expect(
      await screen.findByText('register.displayName.required'),
    ).toBeInTheDocument();
  });

  it('shows avatar preview after selecting file', async () => {
    renderRegister();
    const input = screen.getByTestId('avatar-input') as HTMLInputElement;
    const file = makeFile('me.png', 'image/png', 1024);

    fireEvent.change(input, { target: { files: [file] } });

    const img = await screen.findByAltText('register.avatar.previewAlt');
    expect(img).toHaveAttribute('src', 'blob:preview');
  });

  it('rejects non-image file', () => {
    renderRegister();
    const input = screen.getByTestId('avatar-input') as HTMLInputElement;
    const file = makeFile('doc.pdf', 'application/pdf', 1024);

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText('register.avatar.invalidType')).toBeInTheDocument();
    expect(
      screen.queryByAltText('register.avatar.previewAlt'),
    ).not.toBeInTheDocument();
  });

  it('rejects oversized file', () => {
    renderRegister();
    const input = screen.getByTestId('avatar-input') as HTMLInputElement;
    const file = makeFile('big.png', 'image/png', 3 * 1024 * 1024);

    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText('register.avatar.tooLarge')).toBeInTheDocument();
  });

  it('submits without avatar — creates user and profile', async () => {
    signUpWithEmail.mockResolvedValue({
      data: {
        user: { id: 'user-1', email: 'alice@example.com' },
        session: { accessToken: 't' },
      },
      error: null,
    });

    renderRegister();
    fillValid();
    fireEvent.submit(screen.getByRole('button', { name: 'register.btn' }));

    await waitFor(() => expect(signUpWithEmail).toHaveBeenCalledTimes(1));
    expect(signUpWithEmail).toHaveBeenCalledWith(
      'alice@example.com',
      'secret123',
      { displayName: 'Alice' },
    );
    expect(uploadAvatar).not.toHaveBeenCalled();
    expect(updateProfile).not.toHaveBeenCalled();
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/chat'));
  });

  it('submits with avatar — uploads and stores URL', async () => {
    signUpWithEmail.mockResolvedValue({
      data: {
        user: { id: 'user-1', email: 'alice@example.com' },
        session: { accessToken: 't' },
      },
      error: null,
    });
    uploadAvatar.mockResolvedValue({
      path: 'user-1/123-me.png',
      publicUrl: 'https://cdn/avatars/user-1/me.png',
    });

    renderRegister();
    fillValid();
    fireEvent.change(screen.getByTestId('avatar-input'), {
      target: { files: [makeFile('me.png', 'image/png', 1024)] },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'register.btn' }));

    await waitFor(() => expect(uploadAvatar).toHaveBeenCalledTimes(1));
    expect(updateProfile).toHaveBeenCalledWith({
      id: 'user-1',
      avatarUrl: 'https://cdn/avatars/user-1/me.png',
    });
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/chat'));
  });

  it('shows error when avatar upload fails and does not navigate', async () => {
    signUpWithEmail.mockResolvedValue({
      data: {
        user: { id: 'user-1', email: 'alice@example.com' },
        session: { accessToken: 't' },
      },
      error: null,
    });
    uploadAvatar.mockRejectedValue(new Error('boom'));

    renderRegister();
    fillValid();
    fireEvent.change(screen.getByTestId('avatar-input'), {
      target: { files: [makeFile('me.png', 'image/png', 1024)] },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'register.btn' }));

    await waitFor(() =>
      expect(
        screen.getByText('register.avatarUploadFailed'),
      ).toBeInTheDocument(),
    );
    expect(updateProfile).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
