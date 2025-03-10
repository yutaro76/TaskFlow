'use client';

import { useEffect, useState } from 'react';

interface Dictionary {
  tasks_description?: string;
}

const enDictionary = {
  tasks_description: 'This is the list of my tasks.',
};
const jaDictionary = {
  tasks_description: 'こちらは私のタスクの一覧です。',
};

export const useGetText = () => {
  const [currentLanguageSetting, setCurrentLanguageSetting] =
    useState<string>('en');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const browserLanguageSetting = navigator.language;
      localStorage.setItem('language', browserLanguageSetting);
      setCurrentLanguageSetting(localStorage.getItem('language') || 'en');
    }
  }, []);

  const defaultLanguageSetting = currentLanguageSetting.startsWith('ja')
    ? 'ja'
    : 'en';

  return (word: keyof Dictionary) => {
    return defaultLanguageSetting === 'ja'
      ? jaDictionary[word] || word
      : enDictionary[word] || word;
  };
};
