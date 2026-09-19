import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';

/**
 * Local file helpers for assignment photos / attachments and activity pictures.
 *
 * Picked files are COPIED into the app's private document directory so they survive gallery
 * clean-ups and are removed with the app. Nothing is uploaded anywhere.
 */
const FOLDER = 'talkeasy';

function storageDir(): Directory {
  const dir = new Directory(Paths.document, FOLDER);
  if (!dir.exists) dir.create({ idempotent: true, intermediates: true });
  return dir;
}

function safeName(original: string, fallbackExt: string): string {
  const cleaned = original.replace(/[^A-Za-z0-9._-]/g, '_').slice(-60) || `file.${fallbackExt}`;
  return `${Date.now()}_${cleaned}`;
}

/** Copies a picked file into private storage and returns its new file:// URI. */
async function importFile(sourceUri: string, name: string, fallbackExt: string): Promise<string> {
  const source = new File(sourceUri);
  const target = new File(storageDir(), safeName(name, fallbackExt));
  await source.copy(target, { overwrite: true });
  return target.uri;
}

/** Deletes a file we previously imported (ignores anything outside our folder or missing). */
export function deleteImported(uri: string | null | undefined): void {
  if (!uri || !uri.includes(`/${FOLDER}/`)) return;
  try {
    const f = new File(uri);
    if (f.exists) f.delete();
  } catch {
    // ignore
  }
}

export interface PickedPhoto {
  uri: string;
}

/**
 * Lets the parent choose a photo from the gallery or take one with the camera.
 * Returns null if cancelled or permission denied.
 */
export async function pickPhoto(source: 'library' | 'camera'): Promise<PickedPhoto | null> {
  try {
    if (source === 'camera') {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Camera not allowed', 'Allow camera access in the phone settings to take a photo.');
        return null;
      }
    } else {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Photos not allowed', 'Allow photo access in the phone settings to choose a picture.');
        return null;
      }
    }
    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.6, allowsEditing: false })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6, allowsEditing: false });
    if (result.canceled || !result.assets[0]) return null;
    const asset = result.assets[0];
    const uri = await importFile(asset.uri, asset.fileName ?? 'photo.jpg', 'jpg');
    return { uri };
  } catch (err) {
    Alert.alert('Could not add photo', err instanceof Error ? err.message : String(err));
    return null;
  }
}

export interface PickedAttachment {
  uri: string;
  name: string;
}

/** Lets the parent attach any file (PDF, image, document). Returns null if cancelled. */
export async function pickAttachment(): Promise<PickedAttachment | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, multiple: false });
    if (result.canceled || !result.assets[0]) return null;
    const asset = result.assets[0];
    const uri = await importFile(asset.uri, asset.name, 'bin');
    return { uri, name: asset.name };
  } catch (err) {
    Alert.alert('Could not attach file', err instanceof Error ? err.message : String(err));
    return null;
  }
}
