import { QuantityUnit, DietaryCategory } from '@prisma/client';
import * as Yup from 'yup';

export const AddProduceSchema = Yup.object({
  name: Yup.string().required(),
  type: Yup.string().required(),
  location: Yup.string().required(),
  storage: Yup.string().required(),
  quantityValue: Yup.number().positive().required(),
  quantityUnit: Yup.string().required(),
  expiration: Yup.date()
    .nullable()
    .transform((curr: Date | null, orig: string) => (orig === '' ? null : curr))
    .notRequired(),
  owner: Yup.string().required(),
  image: Yup.string()
    .trim()
    .nullable()
    .notRequired()
    .transform((value) => (value === '' ? null : value))
    .url('Must be a valid URL'),  
  restockThreshold: Yup.number()
    .nullable()
    .transform((curr, orig) => (orig === '' ? null : curr))
    .min(0, 'Threshold cannot be negative')
    .notRequired(),
});

export const EditProduceSchema = Yup.object({
  id: Yup.number().required(),
  name: Yup.string().required(),
  type: Yup.string().required(),
  location: Yup.string().required(),
  storage: Yup.string().required(),
  quantityValue: Yup.number().positive().required(),
  quantityUnit: Yup.string().required(),
  expiration: Yup.date()
    .nullable()
    .transform((curr: Date | null, orig: string) => (orig === '' ? null : curr))
    .notRequired(),
  owner: Yup.string().required(),
  image: Yup.string().nullable().notRequired(),

  restockThreshold: Yup.number()
    .nullable()
    .transform((curr, orig) => (orig === '' ? null : curr))
    .min(0, 'Threshold cannot be negative')
    .notRequired(),
});

export const AddLocationSchema = Yup.object({
  name: Yup.string().required('Location name is required'),
  owner: Yup.string().required(),
  address: Yup.string(), // optional — no marker shown if blank
});

export const AddShoppingListSchema = Yup.object({
  name: Yup.string().required('List name is required'),
  owner: Yup.string()
    .required('You must be signed in to create a list')
    .min(1),
});

export const EditShoppingListSchema = Yup.object({
  id: Yup.number().required('ID is required'),
  name: Yup.string().required('List name is required'),
  owner: Yup.string().required('Owner is required'),
});

export const AddShoppingListItemSchema = Yup.object({
  name: Yup.string().required('Item name is required'),
  quantityValue: Yup.number()
    .typeError('Quantity must be a number')
    .positive('Must be greater than 0')
    .required('Quantity is required'),
  quantityUnit: Yup
  .mixed<QuantityUnit>()
  .oneOf(Object.values(QuantityUnit))
  .nullable(),
  price: Yup.number()
    .typeError('Price must be a number')
    .optional()
    .transform((_, val) => (val !== '' ? Number(val) : null)),
  proteinGrams: Yup.number()
    .min(0, 'Protein cannot be negative')
    .optional()
    .transform((_, val) => (val !== '' ? Number(val) : null)),
  shoppingListId: Yup.number()
    .typeError('A shopping list must be selected')
    .required('Shopping list is required'),
});

export const EditShoppingListItemSchema = Yup.object({
  id: Yup.number().required('ID is required'),
  name: Yup.string().required('Item name is required'),
  quantityValue: Yup.number().positive('Quantity must be positive').required('Quantity is required'),
  quantityUnit: Yup.string().nullable().notRequired(),
  price: Yup.number()
    .nullable()
    .transform((curr, orig) => (orig === '' ? null : curr))
    .min(0, 'Price cannot be negative')
    .notRequired(),
  restockTrigger: Yup.string().nullable().notRequired(),
  customThreshold: Yup.number()
    .nullable()
    .transform((curr, orig) => (orig === '' ? null : curr))
    .min(0, 'Threshold cannot be negative')
    .notRequired(),
});

export const UpdateBudgetSchema = Yup.object({
  budget: Yup.number()
    .typeError('Budget must be a number')
    .positive('Budget must be greater than 0')
    .required('Budget is required'),
});

export const UpdateDietPrefSchema = Yup.object({
  dietPref: Yup.array()
    .of(
      Yup.mixed<DietaryCategory>()
        .oneOf(Object.values(DietaryCategory))
        .required()
    )
    .default([])
    .required(),
});

export const UpdateProfileSchema = Yup.object({
  displayName: Yup.string(),
})