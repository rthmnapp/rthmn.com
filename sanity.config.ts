'use client';
import { visionTool } from '@sanity/vision';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import {
  contentBlock,
  headingBlock,
  headingSplineBlock,
  teamBlock
} from '@/utils/sanity/blocks/index';
import {
  apiVersion,
  dataset,
  projectId,
  studioUrl
} from '@/utils/sanity/lib/api';
import {
  audio,
  category,
  glossary,
  img,
  posts,
  team,
  video,
  changelog,
  module,
  lesson,
  marketData
} from '@/utils/sanity/schemas';

import CustomItem from '@/utils/sanity/ui/CustomItem';
import CustomField from '@/utils/sanity/ui/CustomField';

const title =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_TITLE || 'Reality Designers';

export default defineConfig({
  basePath: studioUrl,
  projectId: projectId || '',
  dataset: dataset || '',
  title,
  schema: {
    types: [
      posts,
      img,
      audio,
      video,
      team,
      category,
      glossary,
      headingBlock,
      headingSplineBlock,
      contentBlock,
      teamBlock,
      module,
      lesson,
      changelog,
      marketData
    ]
  },
  form: {
    components: {
      item: CustomItem,
      field: CustomField
    }
  },
  plugins: [structureTool({}), visionTool({ defaultApiVersion: apiVersion })]
});
