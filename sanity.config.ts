'use client';
import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { contentBlock, headingBlock, headingSplineBlock, teamBlock, teamGrid, sceneBlock } from '@/utils/sanity/blocks/index';
import { dataset, projectId, studioUrl } from '@/utils/sanity/lib/api';
import { audio, category, glossary, img, posts, team, video, changelog, module, lesson, marketData, faq } from '@/utils/sanity/schemas';
import { CustomField } from '@/utils/sanity/ui/CustomField';
import { CustomItem } from '@/utils/sanity/ui/CustomItem';

import { StudioStructure } from '@/utils/sanity/ui/deskStructure';
import { myTheme } from '@/utils/sanity/ui/theme';
import page from '@/utils/sanity/schemas/page';

const title = process.env.NEXT_PUBLIC_SANITY_PROJECT_TITLE || 'RTHMN';

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
            marketData,
            faq,
            page,
            teamGrid,
            sceneBlock,
        ],
    },
    form: {
        components: {
            field: CustomField,
            item: CustomItem,
        },
    },
    plugins: [
        structureTool({
            structure: StudioStructure,
        }),
    ],
    theme: myTheme,
});
