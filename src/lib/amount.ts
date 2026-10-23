import { z } from 'zod'

/** A euro amount as typed on a Spanish keyboard ("12,50"), sent to the API as "12.50". */
export const amountSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(',', '.'))
  .pipe(
    z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, 'Introduce un importe como 12,50')
      .refine((value) => Number(value) > 0, 'El importe debe ser mayor que 0'),
  )

/** The same amount, or nothing: an empty field means "no limit". */
export const optionalAmountSchema = z.union([z.string().trim().length(0).transform(() => null), amountSchema])
