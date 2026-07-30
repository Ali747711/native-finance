import "@/global.css";

import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack screenOptions={{ headerTitle: "Test", headerShown: false }} />;
}
