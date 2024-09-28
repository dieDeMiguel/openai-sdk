type PressReleaseStore = {
  [key: string]: string;
};

const store: PressReleaseStore = {};

export function setGeneratedPressRelease(id: string, text: string) {
  store[id] = text;
}

export function appendGeneratedPressRelease(id: string, text: string) {
  if (store[id]) {
    store[id] += text;
  } else {
    store[id] = text;
  }
}

export function getGeneratedPressRelease(id: string): string | null {
  return store[id] || null;
}
