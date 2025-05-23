import { GROUP, GROUPS, pageBuilderField } from "@/lib/sanity/lib/constant";
import { ogFields } from "@/lib/sanity/lib/og-fields";
import { seoFields } from "@/lib/sanity/lib/seo-fields";
import { createSlug, isUnique } from "@/lib/sanity/lib/slug";
import { defineField, defineType } from "sanity";

export default defineType({
	name: "page",
	title: "Page",
	type: "document",
	groups: GROUPS,
	fields: [
		defineField({
			name: "title",
			type: "string",
			title: "Title",
			group: GROUP.MAIN_CONTENT,
		}),
		defineField({
			name: "description",
			type: "text",
			title: "Description",
			rows: 3,
			group: GROUP.MAIN_CONTENT,
			validation: (rule) => [
				rule
					.min(140)
					.warning(
						"The meta description should be at least 140 characters for optimal SEO visibility in search results",
					),
				rule
					.max(160)
					.warning(
						"The meta description should not exceed 160 characters as it will be truncated in search results",
					),
			],
		}),
		defineField({
			name: "slug",
			type: "slug",
			title: "URL",
			group: GROUP.MAIN_CONTENT,
			options: {
				source: "title",
				slugify: createSlug,
				isUnique,
			},
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "image",
			type: "image",
			title: "Image",
			group: GROUP.MAIN_CONTENT,
		}),
		pageBuilderField,
		...seoFields,
		...ogFields,
	],
	preview: {
		select: {
			title: "title",
			description: "description",
			slug: "slug.current",
			media: "image",
		},
		prepare: ({ title, slug, media }) => ({
			title,
			subtitle: slug,
			media,
		}),
	},
});
