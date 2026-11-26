/// <reference types="astro/client" />

declare namespace astroHTML {
  namespace JSX {
    interface DialogHTMLAttributes {
      closedby?: 'any' | 'closerequest' | 'none';
    }
  }
}
