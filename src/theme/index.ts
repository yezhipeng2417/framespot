import { DefaultTheme, MD3DarkTheme, MD3LightTheme } from "react-native-paper";

// 颜色系统
const colors = {
  primary: "#3498db",
  secondary: "#2ecc71",
  error: "#e74c3c",
  background: "#ffffff",
  surface: "#f8f9fa",
  text: "#2c3e50",
  disabled: "#bdc3c7",
  placeholder: "#95a5a6",
  backdrop: "rgba(0, 0, 0, 0.5)",
  notification: "#e74c3c",
};

// 间距系统
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// 边框圆角
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

// 阴影
export const shadows = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

// 亮色主题
export const lightTheme = {
  ...DefaultTheme,
  ...MD3LightTheme,
  colors: {
    ...DefaultTheme.colors,
    ...colors,
  },
};

// 暗色主题
export const darkTheme = {
  ...DefaultTheme,
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    background: "#121212",
    surface: "#1e1e1e",
    text: "#ecf0f1",
  },
};

export default lightTheme;
