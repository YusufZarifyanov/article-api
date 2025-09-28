export type ArrayItem<List> =
  List extends Array<infer ListItem> ? ListItem : never;
