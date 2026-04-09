import { ThemeProvider } from "next-themes";
import { HomePage } from "./ui/pages/home-page";

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <HomePage />
    </ThemeProvider>
  );
}
