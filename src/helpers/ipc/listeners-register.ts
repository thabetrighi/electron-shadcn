import { BrowserWindow } from "electron";
import { addThemeEventListeners } from "./theme/theme-listeners";
import { addWindowEventListeners } from "./window/window-listeners";
import { registerDatabaseListeners } from "./database/database-listeners";
import { registerPrinterListeners } from "./printer/printer-listeners";

export default function registerListeners(mainWindow: BrowserWindow) {
  addWindowEventListeners(mainWindow);
  addThemeEventListeners();
  registerDatabaseListeners();
  registerPrinterListeners();
}
