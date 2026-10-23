/** Joins class names, skipping the falsy ones: cx('a', isActive && 'b'). */
export function cx(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
