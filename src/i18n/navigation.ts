import { createNavigation } from 'next-intl/navigation';
import { routing } from './routing';

/**
 * ロケールを意識した Link / ナビゲーション API。
 * 言語スイッチャー（docs/02）や各ページのリンクはここから import する。
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
