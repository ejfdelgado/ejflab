export interface LoginData {
  email: string;
  password: string;
  action?: string;
}

export interface PageData {
  date?: Number;
  act?: Number;
  usr?: string;
  tit?: string;
  kw?: string;
  desc?: string;
  path?: string;
  img?: string;
  id?: string;
  image?: string;
}

export interface HttpOptionsData {
  showIndicator?: boolean;
  showError?: boolean;
  pageSize?: number;
  key?: string;
}

export interface BaseComponentData {
  loadUser?: boolean;
  loadPage?: boolean;
}

export interface CardComponentData {
  imageUrl?: string;
  title?: string;
  icon?: string;
  href?: string;
  bigColumn?: number;
}
