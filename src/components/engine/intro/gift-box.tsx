import styles from './intro.module.css';

/** Kotak kado 3D murni CSS — tutup terangkat lalu miring saat dibuka. */
export function GiftBox({ opening }: { opening: boolean }) {
  return (
    <div className={`${styles.gift} ${opening ? styles.giftOpen : ''}`}>
      <div className={styles.giftLid}>
        <span className={styles.ribbonH} />
        <span className={styles.ribbonV} />
        <span className={styles.bowLeft} />
        <span className={styles.bowRight} />
        <span className={styles.bowKnot} />
      </div>
      <div className={styles.giftBody}>
        <span className={styles.ribbonBodyV} />
        <span className={styles.giftGlow} />
      </div>
    </div>
  );
}
