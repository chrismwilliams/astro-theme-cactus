export type Theme = 'light' | 'dark';

export interface IElement {
  readonly as?: keyof HTMLElementTagNameMap;
}