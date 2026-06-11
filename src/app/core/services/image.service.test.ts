import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  ImageValidationError,
  validateChatImage,
  uploadChatImage,
} from './image.service';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeFile = (name: string, type: string, size: number = 1024): File => {
  const buf = new Uint8Array(size);
  return new File([buf], name, { type });
};

// ---------------------------------------------------------------------------
// Supabase mock
// ---------------------------------------------------------------------------

const mockUpload = vi.fn();
const mockGetPublicUrl = vi.fn();

vi.mock('@app/libs/supabase/client', () => ({
  supabase: {
    storage: {
      from: () => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      }),
    },
  },
}));

vi.mock('@core/errors/AppError', () => ({
  mapSupabaseError: () => new Error('upload-failed'),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockUpload.mockResolvedValue({ error: null });
  mockGetPublicUrl.mockReturnValue({
    data: {
      publicUrl: 'https://storage.example/chat-images/rooms/r/u/file.png',
    },
  });
});

// ---------------------------------------------------------------------------
// validateChatImage
// ---------------------------------------------------------------------------

describe('validateChatImage', () => {
  it('accepts valid JPEG under 5 MB', () => {
    const file = makeFile('photo.jpg', 'image/jpeg', 1024 * 1024);
    expect(() => validateChatImage(file)).not.toThrow();
  });

  it('accepts valid PNG', () => {
    const file = makeFile('img.png', 'image/png');
    expect(() => validateChatImage(file)).not.toThrow();
  });

  it('accepts valid WebP', () => {
    const file = makeFile('img.webp', 'image/webp');
    expect(() => validateChatImage(file)).not.toThrow();
  });

  it('accepts valid GIF', () => {
    const file = makeFile('anim.gif', 'image/gif');
    expect(() => validateChatImage(file)).not.toThrow();
  });

  it('rejects unsupported MIME type (PDF)', () => {
    const file = makeFile('doc.pdf', 'application/pdf');
    expect(() => validateChatImage(file)).toThrow(ImageValidationError);
  });

  it('rejects SVG (allowed mime string but not in list)', () => {
    const file = makeFile('icon.svg', 'image/svg+xml');
    expect(() => validateChatImage(file)).toThrow(ImageValidationError);
  });

  it('rejects file larger than 5 MB', () => {
    const file = makeFile('huge.jpg', 'image/jpeg', 5 * 1024 * 1024 + 1);
    expect(() => validateChatImage(file)).toThrow(ImageValidationError);
  });

  it('accepts file exactly at 5 MB limit', () => {
    const file = makeFile('exact.jpg', 'image/jpeg', 5 * 1024 * 1024);
    expect(() => validateChatImage(file)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// uploadChatImage
// ---------------------------------------------------------------------------

describe('uploadChatImage', () => {
  it('uploads with correct path format and returns the storage path', async () => {
    const file = makeFile('My Photo.jpg', 'image/jpeg');
    const path = await uploadChatImage('room-1', 'user-1', file);

    expect(mockUpload).toHaveBeenCalledOnce();
    const [uploadPath, , { contentType }] = mockUpload.mock.calls[0];

    expect(uploadPath).toMatch(/^rooms\/room-1\/user-1\/\d+-my-photo\.jpg$/);
    expect(contentType).toBe('image/jpeg');
    expect(path).toBe(uploadPath);
  });

  it('sanitizes filename (special chars replaced with hyphens)', async () => {
    const file = makeFile('Hello World (2).png', 'image/png');
    await uploadChatImage('r', 'u', file);

    const [uploadPath] = mockUpload.mock.calls[0];
    // sanitizeFilename collapses runs of non-alphanumeric chars into single `-`
    // "Hello World (2).png" → "hello-world-2-.png"
    expect(uploadPath).toMatch(/hello-world-2-\.png$/);
  });

  it('throws when Supabase storage returns an error', async () => {
    mockUpload.mockResolvedValue({ error: { message: 'Storage error' } });
    const file = makeFile('img.jpg', 'image/jpeg');

    await expect(uploadChatImage('r', 'u', file)).rejects.toThrow(
      'upload-failed',
    );
  });

  it('throws ImageValidationError for invalid file before uploading', async () => {
    const file = makeFile('virus.exe', 'application/octet-stream');

    await expect(uploadChatImage('r', 'u', file)).rejects.toThrow(
      ImageValidationError,
    );
    expect(mockUpload).not.toHaveBeenCalled();
  });
});
