import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';

interface State {
  failed: boolean;
}

/**
 * The last line of defence: if any screen throws while drawing, the family sees this friendly page and a
 * button that tries again, instead of a blank or closed app. It deliberately shows no error text (a child
 * should not meet a stack trace) and sends nothing anywhere: TalkEasy has no crash reporting and the
 * privacy summary says nothing leaves the device. The details go to the development console only.
 *
 * "Try again" re-draws the app from its saved data, which is enough for a one-off draw error; if the same
 * thing keeps happening the message says to close and reopen TalkEasy.
 */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown): void {
    if (__DEV__) console.warn('[TalkEasy] a screen failed to draw', error);
  }

  private retry = () => this.setState({ failed: false });

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <View style={styles.center} accessibilityViewIsModal>
        <Text style={styles.emoji} accessible={false}>🚀</Text>
        <Text style={styles.title} accessibilityRole="header">Oops! TalkEasy needs a moment</Text>
        <Text style={styles.message}>Something went wrong. Your stars and progress are safe.</Text>
        <Pressable onPress={this.retry} accessibilityRole="button" accessibilityLabel="Try again" style={styles.button}>
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
        <Text style={styles.hint}>If this keeps happening, close TalkEasy and open it again.</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, backgroundColor: Colors.background },
  emoji: { fontSize: 56 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  message: { fontSize: 18, color: Colors.textMuted, textAlign: 'center' },
  button: { minHeight: 64, minWidth: 200, paddingHorizontal: 32, borderRadius: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary },
  buttonText: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  hint: { fontSize: 16, color: Colors.textMuted, textAlign: 'center' },
});
