type Falsy = false | null | undefined | 0 | 0n | '';

export function cx(...classes: Array<string | Falsy>): string {
  return classes.filter(Boolean).join(' ');
}
