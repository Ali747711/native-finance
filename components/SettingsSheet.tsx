import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

/**
 * Bottom-sheet shell for the settings edit forms, built on the `modal-*` classes
 * already defined in `global.css`.
 *
 * `onRequestClose` is wired as well as the close button because Android's back
 * gesture goes through it — without it the sheet becomes a trap on that
 * platform.
 */
export default function SettingsSheet({
  visible,
  title,
  onClose,
  children,
}: SettingsSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        className="modal-overlay"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable
          className="flex-1"
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        />

        <View className="modal-container">
          <View className="modal-header">
            <Text className="modal-title">{title}</Text>
            <Pressable
              className="modal-close"
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Text className="modal-close-text">×</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerClassName="modal-body"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
