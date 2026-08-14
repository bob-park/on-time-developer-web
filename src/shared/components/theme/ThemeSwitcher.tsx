'use client';

import { setTheme } from '@/app/themeAction';
import { Theme } from '@/shared/providers/theme/ThemeProvider';

import cx from 'classnames';

const THEMES: Theme[] = ['light', 'dark'];

export default function ThemeSwitcher({ current }: Readonly<{ current: Theme }>) {
  // handle
  const handleChange = async (theme: Theme) => {
    await setTheme(theme);
  };

  return (
    <div
      role="radiogroup"
      className={cx('flex items-center gap-[2px] rounded-lg border border-white/10 bg-white/5 p-[3px]')}
    >
      {THEMES.map((theme, index) => (
        <button
          key={theme}
          type="button"
          onClick={() => handleChange(theme)}
          className={cx(
            'btn px-2 py-1 text-[11.5px] font-bold tracking-[0.3px] transition-colors',
            current === theme ? '' : 'text-gray-300 hover:text-white/70',
          )}
        >
          {THEMES[index]}
        </button>
      ))}
    </div>
  );
}
