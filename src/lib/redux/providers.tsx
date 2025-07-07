'use client';

import { ReactNode } from 'react';
import { makeStore } from './store';
import { Provider } from 'react-redux';

const store = makeStore();

export default function ReduxProvider({ children }: { children: ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}