import React from 'react';
import type {LocationId} from '../types';
import {City, Desert, Highway, Tech, WeatherOutside} from './outdoors';
import {Apartment, Greenhouse, Shelter, WeatherInside} from './interiors';
import {Complex, Lab} from './facilities';
import type {LocProps} from './shared';

/** Освещение персонажей по локациям: контурный свет и общий фильтр цвета. */
export interface LightDef {
  rim: string;
  rimAmount: number;
  filter: string;
}

export const LIGHT: Record<LocationId, LightDef> = {
  city: {rim: '#ffb070', rimAmount: 0.95, filter: 'sepia(0.18) saturate(1.1) brightness(0.95)'},
  apartment: {rim: '#ff9a4a', rimAmount: 0.7, filter: 'sepia(0.2) brightness(0.9)'},
  shelter: {rim: '#ffc857', rimAmount: 0.6, filter: 'brightness(0.82) saturate(0.85)'},
  weather: {rim: '#ffb070', rimAmount: 0.75, filter: 'sepia(0.15) brightness(0.88)'},
  complex: {rim: '#6fe0ff', rimAmount: 1, filter: 'hue-rotate(8deg) brightness(1.05) saturate(0.95)'},
  lab: {rim: '#6fe0ff', rimAmount: 1, filter: 'hue-rotate(10deg) brightness(1.12) saturate(0.95)'},
  desert: {rim: '#ffcf8a', rimAmount: 1, filter: 'sepia(0.22) brightness(0.98)'},
  highway: {rim: '#ffa070', rimAmount: 0.85, filter: 'sepia(0.2) brightness(0.9)'},
  tech: {rim: '#ffb070', rimAmount: 0.85, filter: 'sepia(0.18) brightness(0.95)'},
  greenhouse: {rim: '#a6ff9a', rimAmount: 0.55, filter: 'brightness(0.9) saturate(1.05)'},
};

export const LocationView: React.FC<{id: LocationId} & LocProps> = ({id, ...p}) => {
  switch (id) {
    case 'city':
      return <City {...p} />;
    case 'apartment':
      return <Apartment {...p} />;
    case 'shelter':
      return <Shelter {...p} />;
    case 'weather':
      return p.variant === 'outside' ? <WeatherOutside {...p} /> : <WeatherInside {...p} />;
    case 'complex':
      return <Complex {...p} />;
    case 'lab':
      return <Lab {...p} />;
    case 'desert':
      return <Desert {...p} />;
    case 'highway':
      return <Highway {...p} />;
    case 'tech':
      return <Tech {...p} />;
    case 'greenhouse':
      return <Greenhouse {...p} />;
  }
};
