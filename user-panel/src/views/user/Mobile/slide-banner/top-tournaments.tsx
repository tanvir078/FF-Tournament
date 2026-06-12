import { useMemo, useRef, useState } from 'react';
import { Flame, Gamepad2, Sparkles, Star, Trophy } from 'lucide-react';
import styles from '../../../../styles/BannerSlider.module.css';

type Category = {
  label: string;
  value: string;
};

type PromoBanner = {
  title: string;
  subtitle: string;
  accent: string;
  cta: string;
  icon: typeof Trophy;
};

type GameCard = {
  title: string;
  meta: string;
  tone: string;
};

const categories: Category[] = [
  { label: 'Live', value: 'live' },
  { label: 'Free Fire', value: 'free-fire' },
  { label: 'Squad', value: 'squad' },
  { label: 'Duo', value: 'duo' },
  { label: 'Clash', value: 'clash' },
  { label: 'New', value: 'new' },
  { label: 'Popular', value: 'popular' },
];

const promoBanners: PromoBanner[] = [
  {
    title: 'Daily Clash',
    subtitle: 'Fast entry rooms with instant match alerts.',
    accent: '৳5K Prize',
    cta: 'Join Now',
    icon: Flame,
  },
  {
    title: 'Squad Royale',
    subtitle: 'Build your team and lock the next lobby.',
    accent: '48 Slots',
    cta: 'View',
    icon: Trophy,
  },
  {
    title: 'Rising Stars',
    subtitle: 'New player friendly contests every week.',
    accent: 'Free Entry',
    cta: 'Play',
    icon: Star,
  },
];

const gameCards: GameCard[] = [
  { title: 'Free Fire', meta: '12 open', tone: 'from-orange-500 to-red-600' },
  { title: 'Clash Squad', meta: '8 live', tone: 'from-sky-500 to-blue-700' },
  { title: 'Battle Royale', meta: '24 teams', tone: 'from-emerald-500 to-teal-700' },
  { title: 'Duo Cup', meta: '6 open', tone: 'from-violet-500 to-fuchsia-700' },
  { title: 'Solo Rush', meta: 'New', tone: 'from-yellow-400 to-orange-600' },
  { title: 'Weekend Final', meta: 'Featured', tone: 'from-rose-500 to-purple-700' },
];

export default function TopTournamentsBanner() {
  const [activeCategory, setActiveCategory] = useState(categories[0].value);
  const categoryRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const activeLabel = useMemo(
    () => categories.find((category) => category.value === activeCategory)?.label || 'Live',
    [activeCategory]
  );

  const handleCategoryClick = (category: Category) => {
    setActiveCategory(category.value);
    categoryRefs.current[category.value]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  };

  return (
    <section className={styles.casino_layout_root} aria-label="Top tournaments">
      <div className={styles.slider_banners_root}>
        <div className={styles.banner_swiper}>
          {promoBanners.map((banner) => {
            const Icon = banner.icon;

            return (
              <article key={banner.title} className={styles.banner_slide}>
                <div className={styles.banner_content}>
                  <div className={styles.text_container}>
                    <span className={styles.prize_tag}>{banner.accent}</span>
                    <h2 className={styles.banner_title}>{banner.title}</h2>
                    <p className={styles.banner_subtitle}>{banner.subtitle}</p>
                    <button className={styles.play_button} type="button">
                      {banner.cta}
                    </button>
                  </div>
                  <div className={styles.image_container} aria-hidden="true">
                    <Icon className={styles.hero_icon} />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <nav className={styles.sticky_header_container} aria-label="Tournament categories">
        <div className={styles.category_swiper}>
          {categories.map((category) => (
            <button
              key={category.value}
              ref={(element) => {
                categoryRefs.current[category.value] = element;
              }}
              type="button"
              onClick={() => handleCategoryClick(category)}
              className={
                category.value === activeCategory
                  ? styles.category_tab_active
                  : styles.category_tab
              }
              aria-pressed={category.value === activeCategory}
            >
              {category.label}
            </button>
          ))}
        </div>
      </nav>

      <div className={styles.casino_content_layout}>
        <div className={styles.section_header}>
          <div>
            <p className={styles.section_eyebrow}>
              <Sparkles className={styles.section_eyebrow_icon} />
              {activeLabel}
            </p>
            <h3 className={styles.section_title}>Top Tournaments</h3>
          </div>
          <button className={styles.see_all} type="button">
            See all
          </button>
        </div>

        <div className={styles.games_grid}>
          {gameCards.map((game) => (
            <button key={game.title} className={styles.game_card} type="button">
              <span className={`${styles.game_card_art} bg-gradient-to-br ${game.tone}`}>
                <Gamepad2 className={styles.game_card_icon} />
              </span>
              <span className={styles.game_card_title}>{game.title}</span>
              <span className={styles.game_card_meta}>{game.meta}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
