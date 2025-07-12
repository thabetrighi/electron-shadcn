import { exposeThemeContext } from "./theme/theme-context";
import { exposeWindowContext } from "./window/window-context";
import { exposeDatabaseContext } from "./database/database-context";
import { exposePrinterContext } from "./printer/printer-context";

export default function exposeContexts() {
  exposeWindowContext();
  exposeThemeContext();
  exposeDatabaseContext();
  exposePrinterContext();
}
