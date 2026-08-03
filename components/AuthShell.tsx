import { styled } from "nativewind";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView as RNNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNNSafeAreaView);

/**
 * Screen chrome shared by every auth route: safe area, keyboard avoidance, and
 * a scroll container that still lets taps through to buttons while the keyboard
 * is open (`keyboardShouldPersistTaps`). Without that last flag the first tap on
 * the submit button only dismisses the keyboard, which reads as a dead button.
 */
export default function AuthShell({ children }: AuthShellProps) {
  return (
    <SafeAreaView className="auth-safe-area" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        className="auth-screen"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="auth-scroll"
          contentContainerClassName="auth-content"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
