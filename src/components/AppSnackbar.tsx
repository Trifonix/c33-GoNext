import { Snackbar } from 'react-native-paper';

type Props = {
  message: string | null;
  onDismiss: () => void;
  duration?: number;
};

export function AppSnackbar({ message, onDismiss, duration = 3000 }: Props) {
  return (
    <Snackbar visible={!!message} onDismiss={onDismiss} duration={duration}>
      {message}
    </Snackbar>
  );
}
