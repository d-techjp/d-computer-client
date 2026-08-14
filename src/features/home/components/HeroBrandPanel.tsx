import styles from "./HeroBrandPanel.module.css";

export function HeroBrandPanel() {
  return (
    <div className={styles.panel}>
      <svg
        className={styles.circuit}
        viewBox="0 0 680 470"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          className={styles.frameLine}
          d="M92 24H535L558 47H650V162M650 198V358H578L548 390H124L94 360H28V252M28 220V86H62L92 56"
        />
        <path className={styles.frameLine} d="M28 146H10M650 110H670M180 390V446H226" />
        <path className={`${styles.frameLine} ${styles.frameDetail}`} d="M302 24V8H372M650 292H622L602 312M426 390V418H512" />

        <path
          className={styles.ledTrace}
          pathLength="1000"
          d="M92 24H535L558 47H650V162"
        />

        <circle className={`${styles.node} ${styles.nodeOne}`} cx="92" cy="24" r="4" />
        <circle className={`${styles.node} ${styles.nodeTwo}`} cx="558" cy="47" r="4" />
        <circle className={`${styles.node} ${styles.nodeThree}`} cx="650" cy="162" r="4" />
        <circle className={`${styles.node} ${styles.nodeStatic}`} cx="28" cy="252" r="3" />
      </svg>

      <div className={styles.content}>
        <div className={styles.topMeta} aria-hidden="true">
          <span className={styles.index}>01</span>
          <span className={styles.systemState}>
            <i /> SYSTEM READY
          </span>
        </div>

        <h1 className={styles.title}>D-TECH</h1>

        <div className={styles.divider} aria-hidden="true">
          <span />
          <b>{"////"}</b>
          <i />
        </div>

        <p className={styles.eyebrow}>PERFORMANCE ENGINEERED</p>
        <p className={styles.slogan} lang="ja">
          性能を、妥協しない。
        </p>
        <p className={styles.copy} lang="ja">
          高品質なパーツと確かな技術で、
          <br />
          最高のパフォーマンスを。
        </p>

        <div className={styles.bottomMeta} aria-hidden="true">
          <span>CORE ONLINE</span>
          <span className={styles.coordinates}>DT // 01.08</span>
        </div>
      </div>
    </div>
  );
}
