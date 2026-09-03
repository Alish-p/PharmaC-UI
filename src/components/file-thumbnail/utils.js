import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

// Define more types here
const FORMAT_PDF = ['pdf'];
const FORMAT_TEXT = ['txt'];
const FORMAT_PHOTOSHOP = ['psd'];
const FORMAT_WORD = ['doc', 'docx'];
const FORMAT_EXCEL = ['xls', 'xlsx'];
const FORMAT_ZIP = ['zip', 'rar', 'iso'];
const FORMAT_ILLUSTRATOR = ['ai', 'esp'];
const FORMAT_POWERPOINT = ['ppt', 'pptx'];
const FORMAT_AUDIO = ['wav', 'aif', 'mp3', 'aac'];
const FORMAT_IMG = ['jpg', 'jpeg', 'gif', 'bmp', 'png', 'svg', 'webp'];
const FORMAT_VIDEO = ['m4v', 'avi', 'mpg', 'mp4', 'webm'];

const iconUrl = (icon) => `${CONFIG.site.basePath}/assets/icons/files/${icon}.svg`;

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

function stripQueryAndHash(url = '') {
  if (typeof url !== 'string') return '';
  // Remove hash first, then query string
  const noHash = url.split('#')[0];
  return noHash.split('?')[0];
}

// ----------------------------------------------------------------------

export function fileFormat(fileUrl) {
  // Support both URLs/paths and MIME types
  if (!fileUrl) return '';

  const value = String(fileUrl).toLowerCase();

  // If looks like a MIME type (e.g., image/png, application/pdf)
  if (value.includes('/') && !value.startsWith('http') && !value.startsWith('blob:')) {
    const [type, subtype] = value.split('/');
    if (type === 'image') return 'image';
    if (type === 'audio') return 'audio';
    if (type === 'video') return 'video';
    if (subtype === 'pdf') return 'pdf';
    return subtype || type;
  }

  const ext = fileTypeByUrl(value);

  if (FORMAT_TEXT.includes(ext)) return 'txt';
  if (FORMAT_ZIP.includes(ext)) return 'zip';
  if (FORMAT_AUDIO.includes(ext)) return 'audio';
  if (FORMAT_IMG.includes(ext)) return 'image';
  if (FORMAT_VIDEO.includes(ext)) return 'video';
  if (FORMAT_WORD.includes(ext)) return 'word';
  if (FORMAT_EXCEL.includes(ext)) return 'excel';
  if (FORMAT_POWERPOINT.includes(ext)) return 'powerpoint';
  if (FORMAT_PDF.includes(ext)) return 'pdf';
  if (FORMAT_PHOTOSHOP.includes(ext)) return 'photoshop';
  if (FORMAT_ILLUSTRATOR.includes(ext)) return 'illustrator';

  return ext;
}

// ----------------------------------------------------------------------

export function fileThumb(fileUrl) {
  let thumb;

  switch (fileFormat(fileUrl)) {
    case 'folder':
      thumb = iconUrl('ic-folder');
      break;
    case 'txt':
      thumb = iconUrl('ic-txt');
      break;
    case 'zip':
      thumb = iconUrl('ic-zip');
      break;
    case 'audio':
      thumb = iconUrl('ic-audio');
      break;
    case 'video':
      thumb = iconUrl('ic-video');
      break;
    case 'word':
      thumb = iconUrl('ic-word');
      break;
    case 'excel':
      thumb = iconUrl('ic-excel');
      break;
    case 'powerpoint':
      thumb = iconUrl('ic-power_point');
      break;
    case 'pdf':
      thumb = iconUrl('ic-pdf');
      break;
    case 'photoshop':
      thumb = iconUrl('ic-pts');
      break;
    case 'illustrator':
      thumb = iconUrl('ic-ai');
      break;
    case 'image':
      thumb = iconUrl('ic-img');
      break;
    default:
      thumb = iconUrl('ic-file');
  }
  return thumb;
}

// ----------------------------------------------------------------------

export function fileTypeByUrl(fileUrl) {
  if (!fileUrl) return '';
  const clean = stripQueryAndHash(String(fileUrl));
  const ext = clean.split('.').pop();
  return (ext || '').toLowerCase();
}

// ----------------------------------------------------------------------

export function fileNameByUrl(fileUrl) {
  if (!fileUrl) return '';
  const clean = stripQueryAndHash(String(fileUrl));
  try {
    return decodeURIComponent(clean.split('/').pop());
  } catch (e) {
    return clean.split('/').pop();
  }
}

// ----------------------------------------------------------------------

export function fileData(file) {
  // From url string
  if (typeof file === 'string') {
    return {
      preview: file,
      name: fileNameByUrl(file),
      type: fileTypeByUrl(file),
      size: undefined,
      path: file,
      lastModified: undefined,
      lastModifiedDate: undefined,
    };
  }

  // From object (File or remote file-like object)
  const path = file?.path || file?.url || undefined;
  const rawName = file?.name || (path ? fileNameByUrl(path) : undefined);
  const safeName = rawName && rawName.includes('?') ? fileNameByUrl(rawName) : rawName;

  return {
    name: safeName,
    size: file?.size,
    path,
    type: file?.type,
    preview: file?.preview,
    lastModified: file?.lastModified,
    lastModifiedDate: file?.lastModifiedDate,
  };
}
