export default function Home() {
  return (
    <main className="container">
      <header><img src="/brand/formance.svg" alt="Formance" width="230" height="48" /><span className="badge">Seminario · MVP</span></header>
      <section className="intro"><p className="eyebrow">TU PROGRESO, EN UN SOLO LUGAR</p><h1>Cada registro cuenta.<br /><span>Cada semana te acerca.</span></h1><p className="description">Entrenamiento, alimentación y evolución del peso conectados para entender tu progreso.</p></section>
      <section className="cards" aria-label="Áreas de la aplicación">
        <article><span className="number">01</span><h2>Entrenamiento</h2><p>Tus rutinas, series y sesiones en un mismo historial.</p></article>
        <article><span className="number">02</span><h2>Alimentación</h2><p>Registrá tus comidas y consultá tus totales diarios.</p></article>
        <article><span className="number">03</span><h2>Progreso</h2><p>Seguí tu peso y descubrí cómo fue tu semana.</p></article>
      </section>
      <footer>Estamos preparando el primer recorrido de Formance.</footer>
    </main>
  );
}
