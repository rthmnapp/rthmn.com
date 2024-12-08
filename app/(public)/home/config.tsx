'use client';
import { useMemo } from 'react';
import { BoxSection } from './modules/BoxSection';
import { BoxInfo } from './modules/BoxInfo';

export type SceneState = {
  id: string;
  buttonName: string; // Name in Spline scene
  // Add any other state-specific properties here
};

export const SCENE_STATES: Record<string, SceneState> = {
  baseState: {
    id: 'baseState',
    buttonName: 'BaseState'
  },
  state1: {
    id: 'state1',
    buttonName: 'State1'
  },
  state2: {
    id: 'state2',
    buttonName: 'State2'
  },
  state3: {
    id: 'state3',
    buttonName: 'State3'
  }
  // Add more states as needed...
};

export const useSceneConfig = (
  splineRef: any,
  visibility?: {
    [key: string]: { isVisible: boolean; distance: number; isScaled: boolean };
  }
) => {
  return useMemo(
    () => [
      {
        id: 'datastream',
        name: 'DataStream',
        scaleIn: 0,
        scaleOut: 6800,
        fadeIn: 0,
        fadeOut: 6800
      },
      {
        id: 'boxsection-controls',
        name: 'BoxSection',
        scaleIn: 1000,
        scaleOut: 1100,
        fadeIn: 800,
        fadeOut: 1000,
        component: (
          <BoxSection
            splineRef={splineRef}
            visibility={visibility?.['boxsection-controls']}
          />
        )
      },
      {
        id: 'boxsection-info',
        name: 'BoxSection',
        scaleIn: 500,
        scaleOut: 1000,
        fadeIn: 600,
        fadeOut: 850,
        component: <BoxInfo visibility={visibility?.['boxsection-info']} />
      }
    ],
    [splineRef, visibility]
  );
};
