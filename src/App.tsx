import { ThemeProvider } from "next-themes";
import { HomePage } from "./ui/pages/home-page";
import { ErrorBoundary } from "./ui/components/error-boundary";

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <HomePage />
      </ThemeProvider>
    </ErrorBoundary>
  );
}
