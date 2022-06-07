import { onMount, atom, action } from 'nanostores'
import { getDocumentClassList, getInitialTheme } from "@/util";
import type { Theme } from '@/types'

const initialValue = null;

const theme = atom<Theme>(initialValue);

onMount(theme, () => {
  if (import.meta.env.SSR) {
    return;
  }
  theme.set(getInitialTheme());
});

theme.listen(value => {
  const classList = getDocumentClassList();
  localStorage.setItem("theme", value);
  if (value === "dark") {
    classList.add("dark");
  } else {
    classList.remove("dark");
  }
})

const toggleTheme = action(theme, 'toggle', (store) => {
  store.set(store.get() === 'light' ? 'dark' : "light")
})

const setTheme = action(theme, 'setTheme', (store, newTheme: Theme) => {
  store.set(newTheme)
})

export { theme, toggleTheme, setTheme }