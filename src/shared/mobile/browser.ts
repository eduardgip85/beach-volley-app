import { Browser } from "@capacitor/browser";

export async function openNativeBrowser(url: string) {
  await Browser.open({
    url,
    presentationStyle: "fullscreen",
  });
}

export async function closeNativeBrowser() {
  await Browser.close();
}
