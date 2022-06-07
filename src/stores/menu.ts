import { atom, action } from 'nanostores'

const menuOpen = atom<boolean>(false);

menuOpen.listen(isOpen => {
  const body = document.body;
  if (isOpen) {
    body.classList.add("menu-open");
  } else {
    body.classList.remove("menu-open");
  }
})

const toggleMenuOpen = action(menuOpen, 'toggleMenu', (store) => {
  store.set(!store.get());
})

const setMenuOpen = action(menuOpen, 'setMenuOpen', (store, newState: boolean) => {
  store.set(newState);
})



export { menuOpen, toggleMenuOpen, setMenuOpen }