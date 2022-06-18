import { onMount, atom, action } from 'nanostores'
import { getDocumentClassList, getInitialTheme, setThemeColorMetaContent } from "@/util";
import type { Theme } from '@/types'
import themeMeta from '../site-meta.config'

const initialValue = null;

const theme = atom<Theme>(initialValue);

// set initial value to theme based on user preference
onMount(theme, () => {
  if (import.meta.env.SSR) {
    return;
  }
  const initialValue = getInitialTheme()
  theme.set(initialValue); // set the theme
})

// subscribe to theme toggle
// 1. add / remove class 'dark' on html
// 2. set the meta "theme-color" content
theme.listen(value => {
  const classList = getDocumentClassList();
  localStorage.setItem("theme", value);
  if (value === "dark") {
    classList.add("dark");
    setThemeColorMetaContent(themeMeta.themeColorDark)
  } else {
    classList.remove("dark");
    setThemeColorMetaContent(themeMeta.themeColorLight)
  }
})

const toggleTheme = action(theme, 'toggle', (store) => {
  store.set(store.get() === 'light' ? 'dark' : "light")
})

const setTheme = action(theme, 'setTheme', (store, newTheme: Theme) => {
  store.set(newTheme)
})

export { theme, toggleTheme, setTheme }