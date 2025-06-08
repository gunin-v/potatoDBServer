import * as yup from "yup";

export type ProductQueryDTO = {
  date_from?: string;
  date_to?: string;
  store?: string;
  limit?: string;
  offset?: string;
};

export const productQuerySchema = yup.object({
  date_from: yup
    .string()
    .optional()
    .test("is-date", "Invalid date_from format. Use YYYY-MM-DD.", (value) =>
      !value ? true : !isNaN(Date.parse(value))
    ),
  date_to: yup
    .string()
    .optional()
    .test("is-date", "Invalid date_to format. Use YYYY-MM-DD.", (value) =>
      !value ? true : !isNaN(Date.parse(value))
    ),
  store: yup.string().optional(),
  limit: yup
    .string()
    .optional()
    .test("is-positive", "Limit must be a positive number.", (value) =>
      !value ? true : Number(value) > 0
    ),
  offset: yup
    .string()
    .optional()
    .test("is-non-negative", "Offset must be a non-negative number.", (value) =>
      !value ? true : Number(value) >= 0
    ),
});

export function validateProductQuery(dto: ProductQueryDTO): string | null {
  try {
    productQuerySchema.validateSync(dto);
    return null;
  } catch (e: any) {
    return e.message;
  }
}
