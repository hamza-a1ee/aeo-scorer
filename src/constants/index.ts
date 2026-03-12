export const ACCESS_TOKEN = 'access_token';

export const IS_SERVER = true;

export const TOKEN_EXPIRED_ERROR =
  'Your session has expired. Please log in again.';

export const DOC_ACCEPT: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
};

export const IMAGE_ACCEPT: Record<string, string[]> = {
  'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
};

export const MEDIA_ACCEPT: Record<string, string[]> = {
  'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
  'video/*': ['.mp4', '.webm', '.mov', '.avi', '.mkv'],
  'audio/*': ['.mp3', '.wav', '.m4a', '.ogg', '.webm', '.aac'],
};

export const DOC_ACCEPT_EXTENSIONS = Object.values(DOC_ACCEPT).flat();

export const SEARCH_DEBOUNCE_MS = 300;
