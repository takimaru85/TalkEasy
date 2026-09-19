import { Alert } from 'react-native';

/**
 * Native confirmation dialog (large system buttons on both platforms).
 * Resolves true when the user confirms.
 */
export function confirm(title: string, message: string, confirmLabel = 'Delete'): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
        { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}

export function alertMessage(title: string, message?: string): void {
  Alert.alert(title, message);
}
