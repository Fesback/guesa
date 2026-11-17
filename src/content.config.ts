import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const menuCategories = ['hamburguesas', 'alitas', 'infaltables', 'bebidas', 'extras'] as const;
const weekdays = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'] as const;

const menu = defineCollection({
	loader: glob({ pattern: '**/*.yaml', base: './src/content/menu' }),
	schema: z.object({
		id: z.string().min(1),
		categoria: z.enum(menuCategories),
		nombre: z.string().min(1),
		descripcion: z.string().min(1),
		precio: z.number().positive(),
		precioAnterior: z.number().positive().nullable().default(null),
		etiqueta: z.string().nullable().default(null),
		opciones: z.string().nullable().default(null),
		imagen: z.string().nullable().default(null),
		disponible: z.boolean().default(true),
		destacado: z.boolean().default(false),
		orden: z.number().int().nonnegative().default(0),
	}),
});

const combos = defineCollection({
	loader: glob({ pattern: '**/*.yaml', base: './src/content/combos' }),
	schema: z.object({
		id: z.string().min(1),
		nombre: z.string().min(1),
		descripcion: z.string().min(1),
		incluye: z.array(z.string()).min(1),
		precio: z.number().positive(),
		precioAnterior: z.number().positive().nullable().default(null),
		etiqueta: z.string().nullable().default(null),
		destacado: z.boolean().default(false),
		disponible: z.boolean().default(true),
		orden: z.number().int().nonnegative().default(0),
	}),
});

const promos = defineCollection({
	loader: glob({ pattern: '**/*.yaml', base: './src/content/promos' }),
	schema: z.object({
		id: z.string().min(1),
		dia: z.enum(weekdays),
		titulo: z.string().min(1),
		detalle: z.string().min(1),
		precio: z.number().positive(),
		precioAnterior: z.number().positive().nullable().default(null),
		etiqueta: z.string().nullable().default(null),
		tipo: z.enum(['combo', 'upgrade', 'gratis']).default('combo'),
		incluye: z.array(z.string()).default([]),
		requiereBurger: z.boolean().default(false),
		excluye: z.array(z.string()).default([]),
		disponible: z.boolean().default(true),
		orden: z.number().int().nonnegative().default(0),
	}),
});

const opciones = defineCollection({
	loader: glob({ pattern: '**/*.yaml', base: './src/content/opciones' }),
	schema: z.object({
		id: z.string().min(1),
		nombre: z.string().min(1),
		ayuda: z.string().default(''),
		opciones: z
			.array(
				z.object({
					id: z.string().min(1),
					nombre: z.string().min(1),
					precio: z.number().nonnegative(),
					descripcion: z.string().default(''),
				}),
			)
			.min(1),
	}),
});

const faq = defineCollection({
	loader: glob({ pattern: '**/*.yaml', base: './src/content/faq' }),
	schema: z.object({
		pregunta: z.string().min(1),
		respuesta: z.string().min(1),
		orden: z.number().int().nonnegative().default(0),
	}),
});

export const collections = { menu, combos, promos, opciones, faq };
