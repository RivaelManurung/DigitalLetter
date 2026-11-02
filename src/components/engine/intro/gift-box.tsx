import { INTRO_IMAGES } from '@/design/theme-images';
import styles from './intro.module.css';

/** Kotak kado ilustrasi: tutup terangkat dan berputar, cahaya naik dari dalam. */
export function GiftBox({ opening }: { opening: boolean }) {
  return (
    <div className={`${styles.gift} ${opening ? styles.giftOpen : ''}`}>
      <span className={styles.envShadow} aria-hidden="true" />
      <img className={styles.giftBody} src={INTRO_IMAGES.giftBox} alt="" draggable={false} />
      <span className={styles.giftGlow} aria-hidden="true" />
      <img className={styles.giftLid} src={INTRO_IMAGES.giftLid} alt="" draggable={false} />
    </div>
  );
}
