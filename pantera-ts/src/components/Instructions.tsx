export default function Instructions() {
  return (
    <section className="instructions">
      <h2>¿Qué es PANTERA?</h2>
      <p>
        El clásico juego del 3 en raya (Tic-Tac-Toe) elevado a un segundo nivel.
        Así como en el juego original, el objetivo es completar una línea,
        horizontal, vertical o diagonal, con tus fichas.
      </p>

      <h3>¿Cómo se juega?</h3>
      <p>
        En <strong>Pantera</strong> tienes un <strong>macro tablero</strong>,
        básicamente un tablero del 3 en raya pero en cada casilla existe un{" "}
        <strong>mini tablero</strong>.
      </p>
      <p>
        Para marcar una casilla del <strong>macro tablero</strong> con tu ficha
        debes ganar la partida del <strong>mini tablero</strong> de esa misma
        casilla.
      </p>
      <p>
        Así como en el juego original, se considera <strong>empate</strong>{" "}
        cuando todas las casillas están ocupadas pero ningún jugador logró un 3
        en raya.
      </p>

      <h3>Casillas y mini tableros activos</h3>
      <p>
        Una <strong>casilla activa</strong> de un <strong>mini tablero</strong>{" "}
        es aquella que puede ser seleccionada por cualquier jugador y que no
        está marcada con una ficha. Son fáciles de identificar porque se
        encuentran iluminadas con respecto al fondo y a otras casillas
        inactivas.
      </p>
      <p>
        Un <strong>mini tablero</strong> activo es todo aquel que no está
        marcado con una ficha de jugador ni se encuentra en estado de empate,
        por lo tanto al menos una de sus casillas se considera{" "}
        <strong>activa</strong>.
      </p>

      <h3>El truco</h3>
      <p>
        Al inicio puedes elegir cualquiera de las{" "}
        <strong>casillas activas</strong> de cualquier{" "}
        <strong>mini tablero</strong>, sin embargo cada jugada determinará el
        siguiente movimiento de tu contrincante.
      </p>
      <p>
        Por ejemplo: si eliges la casilla superior-izquierda de tu{" "}
        <strong>mini tablero</strong> activo, tu contrincante deberá jugar en el{" "}
        <strong>mini tablero</strong> superior-izquierdo. Si éste no se
        encuentra activo, podrá elegir cualquiera de las{" "}
        <strong>casillas activas</strong> de cualquier{" "}
        <strong>mini tablero</strong>.
      </p>
    </section>
  );
}
